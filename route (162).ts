import { NextResponse } from "next/server";
import { calculateLostHours, calculatorInputSchema } from "@/lib/calculator";
import { prisma } from "@/lib/prisma";
import { scoreLead } from "@/lib/lead-scoring";
import { auditEvent } from "@/lib/audit";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = calculatorInputSchema.safeParse(body);

  if (!parsed.success) {
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
          painPoint: result.suggestedBottleneck,
          clinicSize: input.clients,
          leadScore: scoring.score,
          status: scoring.tier === "hot" ? "NEW" : "RESEARCHED",
          nextStep: "Send lost-hours report and invite to recovery workflow demo",
          notes: result.summary
        }
      });
      leadId = lead.id;

      await prisma.consentOptIn.create({
        data: {
          leadId,
          consentType: "email_marketing",
          consented: true
        }
      });
    }

    const stored = await prisma.calculatorResult.create({
      data: {
        leadId,
        inputs: input,
        weeklyHoursAtRisk: result.hoursAtRiskPerWeek,
        monthlyHoursAtRisk: result.monthlyHoursAtRisk,
        monthlyRevenueLeakage: result.monthlyRevenueLeakage,
        adminHoursSpent: result.adminHoursSpent,
        potentialRecoveredHours10: result.potentialRecoveredHours10,
        potentialRecoveredHours20: result.potentialRecoveredHours20,
        potentialRecoveredHours30: result.potentialRecoveredHours30,
        recommendedModules: result.recommendedModules
      }
    });

    await auditEvent({ action: "calculator_result_created", entityType: "CalculatorResult", entityId: stored.id, after: { leadId, result } });

    return NextResponse.json({ result, persisted: true, leadId, calculatorResultId: stored.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ result, persisted: false, error: "Result computed, but database persistence failed." }, { status: 200 });
  }
}
