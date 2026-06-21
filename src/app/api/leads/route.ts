import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { scoreLead } from "@/lib/lead-scoring";

const leadSchema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().optional(),
  contactRole: z.string().optional(),
  state: z.string().optional(),
  website: z.string().optional(),
  currentEmr: z.string().optional(),
  painPoint: z.string().optional(),
  clinicSize: z.coerce.number().int().optional(),
  serviceModel: z.string().optional(),
  signals: z.array(z.object({ type: z.string(), detail: z.string().optional() })).optional().default([])
});

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ leads: [], source: "clean_slate", warning: "DATABASE_URL is not configured." });
  }

  try {
    const leads = await prisma.lead.findMany({
      orderBy: [{ leadScore: "desc" }, { createdAt: "desc" }],
      include: { intentSignals: true },
      take: 100
    });
    return NextResponse.json({ leads, source: "database" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ leads: [], source: "database_error", error: "Database query failed; no fallback sample leads returned." });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid lead input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;
  const scoring = scoreLead({
    companyName: input.companyName,
    contactRole: input.contactRole,
    clinicSize: input.clinicSize,
    serviceModel: input.serviceModel,
    signals: input.signals
  });

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ lead: { ...input, leadScore: scoring.score }, scoring, persisted: false, warning: "DATABASE_URL is not configured." });
  }

  try {
    const lead = await prisma.lead.create({
      data: {
        source: "MANUAL",
        companyName: input.companyName,
        contactName: input.contactName,
        contactRole: input.contactRole,
        state: input.state,
        website: input.website,
        currentEmr: input.currentEmr,
        painPoint: input.painPoint,
        clinicSize: input.clinicSize,
        serviceModel: input.serviceModel,
        leadScore: scoring.score,
        status: scoring.tier === "hot" ? "NEW" : scoring.tier === "research" ? "RESEARCHED" : "NURTURE",
        notes: scoring.reasons.map((reason) => `${reason.points}: ${reason.label}`).join("\n"),
        intentSignals: {
          create: input.signals.map((signal) => ({
            signalType: signal.type,
            signalDetail: signal.detail ?? signal.type
          }))
        }
      },
      include: { intentSignals: true }
    });
    return NextResponse.json({ lead, scoring, persisted: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Lead creation failed" }, { status: 500 });
  }
}
