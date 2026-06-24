import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { buildCampaignImagePrompts } from "@/lib/campaign-image-prompts";

const campaignImagePromptSchema = z.object({
  market: z.string().trim().min(2).default("United States"),
  audience: z.string().trim().min(2).default("ABA clinic owners, founders, clinical directors and operations managers"),
  focusLabel: z.string().trim().min(2).default("Lost Hours"),
  focusTheme: z.string().trim().min(2).default("Recover the hour before it disappears"),
  landingPage: z.string().trim().min(1).default("/calculator"),
  keywords: z.array(z.string().trim()).default([]),
  variationsPerDay: z.coerce.number().int().min(1).max(20).default(20)
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = campaignImagePromptSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid campaign image prompt request", issues: parsed.error.flatten() }, { status: 400 });

  const prompts = buildCampaignImagePrompts(parsed.data);
  return NextResponse.json({
    prompts,
    variationsPerDay: parsed.data.variationsPerDay,
    totalAssets: prompts.length,
    notice: `Generated ${prompts.length} image prompts: ${parsed.data.variationsPerDay} variations per day for 30 days. Export CSV to feed an image API/bot queue.`
  });
}
