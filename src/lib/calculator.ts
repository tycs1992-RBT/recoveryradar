import { z } from "zod";

export const documentationCleanupOptions = ["rarely", "sometimes", "often"] as const;
export const recoveryWorkflowOptions = ["none", "manual", "partial", "automated"] as const;

export const calculatorInputSchema = z.object({
  clients: z.coerce.number().int().min(1).max(10000),
  sessionsPerClientPerWeek: z.coerce.number().min(0).max(50),
  sessionLengthHours: z.coerce.number().min(0.25).max(12),
  cancellationRate: z.coerce.number().min(0).max(100),
  calloutRate: z.coerce.number().min(0).max(100),
  reimbursementPerHour: z.coerce.number().min(0).max(1000),
  currentRecoveryRate: z.coerce.number().min(0).max(100),
  adminMinutesPerCancellation: z.coerce.number().min(0).max(480),
  documentationCleanupFrequency: z.enum(documentationCleanupOptions),
  recoveryWorkflowMaturity: z.enum(recoveryWorkflowOptions),
  // Retention/compliance context inputs (optional — drive the StaffPulse + clean-claims framing)
  rbtCount: z.coerce.number().min(0).max(5000).optional().default(0),
  lateNoteRate: z.coerce.number().min(0).max(100).optional().default(0),
  contactName: z.string().trim().optional().default(""),
  role: z.string().trim().optional().default(""),
  clinicName: z.string().trim().optional().default(""),
  email: z.string().email().optional().or(z.literal("")),
  currentEmr: z.string().trim().optional().default(""),
  consentToContact: z.coerce.boolean().optional().default(false)
});

export type CalculatorInput = z.infer<typeof calculatorInputSchema>;

export type CalculatorResult = {
  scheduledSessionsPerWeek: number;
  scheduledHoursPerWeek: number;
  cancellationsPerWeek: number;
  calloutsPerWeek: number;
  hoursAtRiskPerWeek: number;
  weeklyRevenueAtRisk: number;
  monthlyHoursAtRisk: number;
  monthlyRevenueLeakage: number;
  recoveredSessionsPerWeek: number;
  recoveredHoursPerWeek: number;
  adminHoursSpent: number;
  documentationCleanupHours: number;
  potentialRecoveredHours10: number;
  potentialRecoveredHours20: number;
  potentialRecoveredHours30: number;
  // Clean-claims (PROVABLE): billable $ at risk from late/missing notes that note-gating protects
  atRiskClaimDollarsMonthly: number;
  cleanClaimsProtectedMonthly: number;
  // Retention CONTEXT (story, not a guaranteed saving): size of the turnover problem StaffPulse helps address
  annualTurnoverCostContext: number;
  suggestedBottleneck: string;
  recommendedModules: string[];
  summary: string;
};

const cleanupHoursPerSession: Record<CalculatorInput["documentationCleanupFrequency"], number> = {
  rarely: 0.25,
  sometimes: 0.5,
  often: 1
};

export function calculateLostHours(input: CalculatorInput): CalculatorResult {
  const scheduledSessionsPerWeek = input.clients * input.sessionsPerClientPerWeek;
  const scheduledHoursPerWeek = scheduledSessionsPerWeek * input.sessionLengthHours;

  const cancellationRate = input.cancellationRate / 100;
  const calloutRate = input.calloutRate / 100;
  const recoveryRate = input.currentRecoveryRate / 100;

  const cancellationsPerWeek = scheduledSessionsPerWeek * cancellationRate;
  const calloutsPerWeek = scheduledSessionsPerWeek * calloutRate;
  const interruptionEvents = cancellationsPerWeek + calloutsPerWeek;
  const hoursAtRiskPerWeek = interruptionEvents * input.sessionLengthHours;
  const weeklyRevenueAtRisk = hoursAtRiskPerWeek * input.reimbursementPerHour;

  const recoveredSessionsPerWeek = interruptionEvents * recoveryRate;
  const recoveredHoursPerWeek = recoveredSessionsPerWeek * input.sessionLengthHours;
  // Estimate cleanup on disrupted/recovered-session workflows rather than every scheduled session.
  // This follows the audit recommendation to keep the admin burden tied to cancellations/callouts.
  const documentationCleanupHours =
    interruptionEvents * cleanupHoursPerSession[input.documentationCleanupFrequency];
  const adminHoursSpent =
    (interruptionEvents * input.adminMinutesPerCancellation) / 60 + documentationCleanupHours;

  const suggestedBottleneck = deriveBottleneck({
    cancellationRate: input.cancellationRate,
    calloutRate: input.calloutRate,
    currentRecoveryRate: input.currentRecoveryRate,
    adminHoursSpent,
    documentationCleanupFrequency: input.documentationCleanupFrequency,
    recoveryWorkflowMaturity: input.recoveryWorkflowMaturity
  });

  const recommendedModules = recommendModules({
    cancellationRate: input.cancellationRate,
    calloutRate: input.calloutRate,
    documentationCleanupFrequency: input.documentationCleanupFrequency,
    recoveryWorkflowMaturity: input.recoveryWorkflowMaturity
  });

  // CLEAN CLAIMS (provable): a share of billable hours is at denial/recoupment risk when notes
  // are late or missing. Note-gating protects most of it. Illustrative; validate with payer mix.
  const monthlyScheduledHours = scheduledHoursPerWeek * 4;
  const lateNoteShare = (input.lateNoteRate ?? 0) / 100;
  // If the user didn't give a late-note rate, infer a small one from cleanup frequency.
  const inferredLateShare =
    lateNoteShare > 0
      ? lateNoteShare
      : input.documentationCleanupFrequency === "often"
        ? 0.06
        : input.documentationCleanupFrequency === "sometimes"
          ? 0.03
          : 0.015;
  const atRiskClaimDollarsMonthly = monthlyScheduledHours * inferredLateShare * input.reimbursementPerHour;
  // Note-gating doesn't fix payer-side denials, but it closes the documentation-caused share. ~80%.
  const cleanClaimsProtectedMonthly = atRiskClaimDollarsMonthly * 0.8;

  // RETENTION CONTEXT (story, NOT a guaranteed saving): size of the annual turnover problem.
  // RBT turnover ~90%/yr midpoint; ~$4,000 to replace one (recruit+train+ramp+rapport). Illustrative.
  const annualTurnoverCostContext = (input.rbtCount ?? 0) * 0.9 * 4000;

  return {
    scheduledSessionsPerWeek,
    scheduledHoursPerWeek,
    cancellationsPerWeek,
    calloutsPerWeek,
    hoursAtRiskPerWeek,
    weeklyRevenueAtRisk,
    monthlyHoursAtRisk: hoursAtRiskPerWeek * 4,
    monthlyRevenueLeakage: weeklyRevenueAtRisk * 4,
    recoveredSessionsPerWeek,
    recoveredHoursPerWeek,
    adminHoursSpent,
    documentationCleanupHours,
    potentialRecoveredHours10: hoursAtRiskPerWeek * 0.1,
    potentialRecoveredHours20: hoursAtRiskPerWeek * 0.2,
    potentialRecoveredHours30: hoursAtRiskPerWeek * 0.3,
    atRiskClaimDollarsMonthly,
    cleanClaimsProtectedMonthly,
    annualTurnoverCostContext,
    suggestedBottleneck,
    recommendedModules,
    summary: buildSummary(hoursAtRiskPerWeek, weeklyRevenueAtRisk, suggestedBottleneck)
  };
}

function deriveBottleneck(input: {
  cancellationRate: number;
  calloutRate: number;
  currentRecoveryRate: number;
  adminHoursSpent: number;
  documentationCleanupFrequency: CalculatorInput["documentationCleanupFrequency"];
  recoveryWorkflowMaturity: CalculatorInput["recoveryWorkflowMaturity"];
}) {
  if (input.recoveryWorkflowMaturity === "none" && input.currentRecoveryRate < 25) {
    return "No formal recovery workflow: cancelled and callout-affected sessions are likely being handled reactively.";
  }
  if (input.cancellationRate >= 15 && input.currentRecoveryRate < 50) {
    return "Scheduling recovery gap: cancellations are high and too few sessions are recovered.";
  }
  if (input.calloutRate >= 10) {
    return "Staff coverage gap: callouts are creating coverage risk and manual scramble.";
  }
  if (input.documentationCleanupFrequency === "often" || input.adminHoursSpent >= 20) {
    return "Documentation readiness gap: cleanup work is consuming operational time after sessions.";
  }
  if (input.recoveryWorkflowMaturity === "manual") {
    return "Manual recovery gap: your team has a process, but it depends heavily on scheduler effort.";
  }
  return "Recovery workflow opportunity: your baseline is measurable, and small process improvements could protect more authorized hours.";
}

function recommendModules(input: {
  cancellationRate: number;
  calloutRate: number;
  documentationCleanupFrequency: CalculatorInput["documentationCleanupFrequency"];
  recoveryWorkflowMaturity: CalculatorInput["recoveryWorkflowMaturity"];
}) {
  const modules = new Set<string>();

  if (input.cancellationRate >= 10 || input.recoveryWorkflowMaturity === "none") {
    modules.add("Scheduler AI™");
    modules.add("Auth Utilization War Room™");
  }

  if (input.calloutRate >= 8) {
    modules.add("SubPool™ Marketplace");
    modules.add("FieldPocket™");
    modules.add("Care Pocket™");
  }

  if (input.documentationCleanupFrequency !== "rarely") {
    modules.add("Compliance Sentinel™");
  }

  modules.add("API Integration Hub™");

  return Array.from(modules);
}

function buildSummary(hoursAtRiskPerWeek: number, weeklyRevenueAtRisk: number, bottleneck: string) {
  const roundedHours = Math.round(hoursAtRiskPerWeek * 10) / 10;
  const roundedRevenue = Math.round(weeklyRevenueAtRisk);
  return `Your current pattern puts about ${roundedHours} weekly hours at risk, or roughly $${roundedRevenue.toLocaleString()} in weekly revenue exposure. Main bottleneck: ${bottleneck}`;
}
