import { NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { auditEvent } from "@/lib/audit";

const leadCaptureSchema = z.object({
  event: z.string(),
  optionValue: z.string().optional(),
  optionLabel: z.string().optional(),
  question: z.string().max(1200).optional(),
  lead: z
    .object({
      name: z.string().optional(),
      role: z.string().optional(),
      clinic: z.string().optional(),
      email: z.string().email().optional().or(z.literal("")),
      consent: z.boolean().optional()
    })
    .optional(),
  transcript: z.unknown().optional()
});

const recoveryAdvisorSystemPrompt = `You are Recovery Advisor for Infinite Pieces AI and Infinite Suite OS.
You answer public website visitor questions about ABA clinic operations, lost hours, cancellations, RBT callouts, caregiver communication, documentation readiness, authorization utilization, no-migration operational recovery, and general ABA administrative workflow.
You are operator-grade, field-informed, and calm under pressure. You may use military-style operational language like triage, readiness, command center, handoff, escalation, and after-action review, but you must not claim classified intelligence, government affiliation, payer approval, legal advice, medical advice, or clinical treatment authority.
Positioning rules:
- Infinite Suite OS is not a full EMR replacement first. It is a no-migration Operational Recovery Core beside the current EMR.
- Core message: Keep your current EMR. Add Infinite Suite beside it. Recover lost hours. Support staff. Keep caregivers informed. Prepare cleaner review-ready workflows.
- CTA: Go to demo.infinitepieces.ai, review the homepage, then click Provider Portal to see the mock OS.
Compliance rules:
- Do not ask for client names, PHI, treatment details, diagnoses, dates of birth, insurance IDs, or sensitive clinical information.
- Do not give patient-specific clinical advice or replace a BCBA, clinician, payer, attorney, compliance officer, or billing expert.
- Use terms like estimate, may, should review, BCBA review required, AI drafts and humans approve, HIPAA-conscious, privacy-aware, audit-ready workflow.
Useful field-average framing:
- Explain that cancellation/callout rates vary by clinic model, payer mix, location, staffing, transportation and family context.
- For public estimates, invite users to use their own numbers in the Lost Hours Calculator rather than presenting guarantees.
- If asked for averages, give broad, non-guaranteed ranges and say the clinic should replace them with its own historical data.
Keep answers concise, practical, and friendly. Always route operational buyers toward the calculator, quiz, Provider Portal, or a walkthrough.`;

function fallbackAnswer(question: string) {
  const q = question.toLowerCase();
  if (q.includes("hipaa") || q.includes("compliance")) {
    return "Recovery Advisor is informational and should not receive PHI. Infinite Suite OS™ is positioned as HIPAA-conscious, privacy-aware and audit-ready in workflow design, with role-based access and human approval. It does not claim blanket legal compliance. Use the Provider Portal demo to see how documentation readiness and review workflows are staged beside the current EMR.";
  }
  if (q.includes("average") || q.includes("cancellation") || q.includes("callout")) {
    return "ABA cancellation and callout patterns vary widely by clinic model, geography, staffing, payer mix and caregiver transportation. For planning, use your own historical data in the Lost Hours Calculator. A practical starting estimate is to test scenarios like 5%, 10%, 15% and 20% cancellation/callout disruption and compare monthly hours at risk. These are estimates, not guarantees.";
  }
  if (q.includes("emr") || q.includes("centralreach") || q.includes("migration")) {
    return "Before replacing an EMR, calculate how many hours are leaking through operational gaps. Infinite Suite OS™ is designed as a no-migration recovery layer beside the current EMR: Scheduler AI™, Auth War Room, SubPool™, FieldPocket™, Care Pocket™, Compliance Sentinel™ and API Integration Hub™ work together to recover at-risk hours and stage cleaner exports.";
  }
  if (q.includes("provider") || q.includes("portal") || q.includes("demo")) {
    return "To see the mock operating system, start on the homepage and click Provider Portal. The portal shows the recovery workflow beside the current EMR: cancellation → recovery route → eligible staff → field support → caregiver update → proof packet → export.";
  }
  return "Recovery Advisor helps with general ABA operations questions about lost hours, cancellations, callouts, caregiver communication, documentation readiness and no-migration recovery workflows. For a personalized estimate, use the Lost Hours Calculator, then click Provider Portal to see the mock operating system. Please do not submit patient information here.";
}

async function answerQuestion(question: string) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return fallbackAnswer(question);

  try {
    const client = new OpenAI({ apiKey: key });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      messages: [
        { role: "system", content: recoveryAdvisorSystemPrompt },
        { role: "user", content: question }
      ],
      temperature: 0.35,
      max_tokens: 450
    });
    return completion.choices[0]?.message?.content ?? fallbackAnswer(question);
  } catch (error) {
    console.error(error);
    return fallbackAnswer(question);
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = leadCaptureSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chat event" }, { status: 400 });
  }

  if (parsed.data.event === "ask_question" && parsed.data.question) {
    const answer = await answerQuestion(parsed.data.question);
    if (process.env.DATABASE_URL) {
      try {
        await prisma.chatbotConversation.create({
          data: {
            transcript: { ...parsed.data, answer } as never
          }
        });
      } catch {
        // non-blocking
      }
    }
    return NextResponse.json({ ok: true, answer, persisted: Boolean(process.env.DATABASE_URL) });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  try {
    let leadId: string | undefined;
    const lead = parsed.data.lead;

    if (parsed.data.event === "lead_capture" && lead?.email && lead.consent) {
      const storedLead = await prisma.lead.create({
        data: {
          source: "CHATBOT",
          companyName: lead.clinic || "Chatbot lead",
          contactName: lead.name || null,
          contactRole: lead.role || null,
          publicEmail: lead.email,
          painPoint: "Requested chatbot follow-up",
          leadScore: 35,
          status: "NEW",
          nextStep: "Review bot transcript and schedule walkthrough",
          notes: "Captured by Recovery Advisor chatbot. No PHI requested."
        }
      });
      leadId = storedLead.id;
      await prisma.consentOptIn.create({
        data: {
          leadId,
          consentType: "email_marketing",
          consented: true
        }
      });
    }

    const conversation = await prisma.chatbotConversation.create({
      data: {
        leadId,
        transcript: parsed.data as never
      }
    });

    await auditEvent({ action: "chatbot_event_logged", entityType: "ChatbotConversation", entityId: conversation.id, after: parsed.data });

    return NextResponse.json({ ok: true, persisted: true, leadId, conversationId: conversation.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: true, persisted: false, error: "Chat event accepted, but database persistence failed." });
  }
}
