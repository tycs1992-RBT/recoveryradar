import { NextResponse } from "next/server";
import { z } from "zod";

const contentSchema = z.object({
  topic: z.string().min(3),
  format: z.string().min(3)
});

function fallbackDraft(topic: string, format: string) {
  return `# ${topic}\n\nFormat: ${format}\n\nPositioning: Keep your current EMR. Add Infinite Suite OS™ beside it as an operational recovery layer.\n\nDraft outline:\n\n1. Open with the lost-hours problem: cancellations, RBT callouts, caregiver communication gaps and documentation cleanup.\n2. Explain why EMR replacement may not solve the operational recovery gap.\n3. Show the recovery workflow: Cancellation → Scheduler AI™ → Auth War Room → SubPool™ → FieldPocket™ → Care Pocket™ → Compliance Sentinel™ → API Hub export.\n4. Recommend the Lost Hours Calculator and ABA Operations Stack Quiz.\n5. CTA: Go to demo.infinitepieces.ai, review the homepage, then click Provider Portal.\n\nCompliance notes:\n- Do not claim blanket HIPAA compliance.\n- Do not ask for PHI.\n- Use human review before publishing or sending.\n`;
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = contentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid content request" }, { status: 400 });
  }

  const { topic, format } = parsed.data;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ content: fallbackDraft(topic, format), provider: "fallback" });
  }

  try {
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You draft marketing content for Recovery Radar and Infinite Suite OS. Position Infinite Suite OS as a no-migration operational recovery layer beside an ABA clinic's current EMR. Do not claim blanket HIPAA compliance. Do not ask for PHI. Add a human-review reminder."
        },
        {
          role: "user",
          content: `Create a ${format} for this topic: ${topic}. Use concise headings, natural SEO language, and include the CTA to visit demo.infinitepieces.ai and click Provider Portal.`
        }
      ],
      temperature: 0.5
    });

    return NextResponse.json({ content: completion.choices[0]?.message.content ?? fallbackDraft(topic, format), provider: "openai" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ content: fallbackDraft(topic, format), provider: "fallback", error: "OpenAI request failed, fallback returned." });
  }
}
