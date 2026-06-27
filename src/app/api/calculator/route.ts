import { NextResponse } from "next/server";
import { calculateLostHours, calculatorInputSchema } from "@/lib/calculator";
import { prisma } from "@/lib/prisma";
import { scoreLead } from "@/lib/lead-scoring";
import { auditEvent } from "@/lib/audit";
import {
  CONSENT_TEXT_VERSION,
  checkRateLimit,
  hasBotTrap,
  logPublicEndpointEvent,
  publicRequestMetadata,
  requestFingerprint
} from "@/lib/public-endpoint-protection";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const rate = checkRateLimit({
    key: requestFingerprint(request, "calculator"),
    limit: 12,
    windowMs: 10 * 60 * 1000
  });

  if (!rate.allowed) {
    await logPublicEndpointEvent("calculator_rate_limited", request, { path: "/api/calculator" });
    return NextResponse.json({ error: "Too many calculator requests. Please try again shortly." }, { status: 429 });
  }

  if (hasBotTrap(body)) {
    await logPublicEndpointEvent("calculator_bot_trap_blocked", request, { path: "/api/calculator" });
    return NextResponse.json({ error: "Request rejected." }, { status: 400 });
  }

  const parsed = calculatorInputSchema.safeParse(body);

  if (!parsed.success) {
    await logPublicEndpointEvent("calculator_validation_failed", request, { issues: parsed.error.flatten() });
    return NextResponse.json({ error: "Invalid calculator input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;
  const result = calculateLostHours(input);

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ result, persisted: false, notice: "DATABASE_URL is not configured, so the result was not persisted." });
  }

  try {
    let leadId: string | undefined;

    if (input.email && input.consentToContact) {
      const scoring = scoreLead({
        companyName: input.clinicName,
        contactRole: input.role,
        clinicSize: input.clients,
        serviceModel: undefined,
        signals: [
          { type: "aba_provider", detail: "Calculator completion" },
          { type: input.cancellationRate >= 10 ? "cancellations" : "operations_pain", detail: "Calculator pain signal" },
          ...(input.calloutRate >= 8 ? [{ type: "staffing_shortage", detail: "Callout rate signal" }] : [])
        ]
      });

      const lead = await prisma.lead.create({
        data: {
          source: "CALCULATOR",
          companyName: input.clinicName || "Calculator lead",
          contactName: input.contactName || null,
          contactRole: input.role || null,
          publicEmail: input.email,
          currentEmr: input.currentEmr || null,
          painPoint: result.summary,
          clinicSize: input.clients,
          leadScore: scoring.score,
          status: scoring.tier === "hot" ? "NEW" : "RESEARCHED",
          nextStep: "Send lost-hours report and invite to the ROI Simulator",
          notes: [
            result.summary,
            "Consent text version: " + CONSENT_TEXT_VERSION,
            "Score reasons:\n" + scoring.reasons.map((reason) => `${reason.points > 0 ? "+" : ""}${reason.points} ${reason.label}`).join("\n")
          ].join("\n\n")
        }
      });
      leadId = lead.id;

      await prisma.consentOptIn.create({
        data: {
          leadId,
          consentType: `email_marketing:${CONSENT_TEXT_VERSION}`,
          consented: true
        }
      });
    }

    const stored = await prisma.calculatorResult.create({
      data: {
        leadId: leadId ?? null,
        inputs: { ...input, consentTextVersion: CONSENT_TEXT_VERSION, requestMetadata: publicRequestMetadata(request) },
        weeklyHoursAtRisk: result.hoursAtRiskPerWeek,
        monthlyHoursAtRisk: result.monthlyHoursAtRisk,
        monthlyRevenueLeakage: result.monthlyRevenueLeakage,
        adminHoursSpent: result.adminHoursSpent
      }
    });

    await auditEvent({ action: "calculator_result_created", entityType: "CalculatorResult", entityId: stored.id, after: { leadId, result, consentTextVersion: CONSENT_TEXT_VERSION, requestMetadata: publicRequestMetadata(request) } });

    return NextResponse.json({ result, persisted: true, leadId, calculatorResultId: stored.id, consentTextVersion: CONSENT_TEXT_VERSION });
  } catch (error) {
    console.error(error);
    await logPublicEndpointEvent("calculator_persistence_failed", request, { message: error instanceof Error ? error.message : "unknown" });
    return NextResponse.json({ result, persisted: false, error: "Result computed, but database persistence failed." }, { status: 200 });
  }
}
