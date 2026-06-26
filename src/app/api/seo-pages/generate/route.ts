import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { generateSeoPage } from "@/lib/seo-page-generator";

const schema = z.object({
  keyword: z.string().trim().min(2),
  slug: z.string().trim().optional(),
  audience: z.string().trim().optional(),
  searchIntent: z.string().trim().optional(),
  competitorAngle: z.string().trim().optional(),
  recoveryFocus: z.string().trim().optional(),
  ctaFocus: z.string().trim().optional(),
  location: z.string().trim().optional(),
  tone: z.string().trim().optional()
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid generate request", issues: parsed.error.flatten() }, { status: 400 });
  }

  // Deterministic, compliance-safe draft. Not persisted — the client decides whether to Save.
  const page = generateSeoPage(parsed.data);
  return NextResponse.json({ page, notice: "Draft generated. Review it, then Save to add it to the page library." });
}
