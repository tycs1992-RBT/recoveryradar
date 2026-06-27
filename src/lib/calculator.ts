import { z } from "zod";

export const documentationCleanupOptions = ["rarely", "sometimes", "often"] as const;

// The Lost Hours Calculator quantifies ONLY what a clinic is losing right now, from numbers the
// clinic already knows to be true (its own cancellation/callout rates, hours, and collected rate).
// It deliberately makes NO recovery or retention claim — nothing here depends on attributing an
// outcome to software. "What you'd recover with Infinite Pieces" is the ROI Simulator's job.
export const calculatorInputSchema = z.object({
  clients: z.coerce.number().int().min(1).max(10000),
  sessionsPerClientPerWeek: z.coerce.number().min(0).max(50),
  sessionLengthHours: z.coerce.number().min(0.25).max(12),
  cancellationRate: z.coerce.number().min(0).max(100),
  calloutRate: z.coerce.number().min(0).max(100),
  reimbursementPerHour: z.coerce.number().min(0).max(1000),
  adminMinutesPerCancellation: z.coerce.number().min(0).max(480),
  documentationCleanupFrequency: z.enum(documentationCleanupOptions),
  lateNoteRate: z.coerce.number().min(0).max(100).optional().default(0),
  // Lead capture (optional — no PHI)
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
  // The bleed — lost billable hours/$ from interrupted sessions (provable from the clinic's own data)
  hoursAtRiskPerWeek: number;
  weeklyRevenueAtRisk: number;
  monthlyHoursAtRisk: number;
  monthlyRevenueLeakage: number;
  annualRevenueLeakage: number;
  // Operational drag (clinic-estimated, still a loss — admin scramble + note cleanup on interruptions)
  adminHoursSpent: number;
  documentationCleanupHours: number;
  monthlyAdminHours: number;
  // Clean-claims at risk — billable $ exposed to denial/recoupment from late/missing notes
  atRiskClaimDollarsMonthly: number;
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

  const cancellationsPerWeek = scheduledSessionsPerWeek * cancellationRate;
  const calloutsPerWeek = scheduledSessionsPerWeek * calloutRate;
  const interruptionEvents = cancellationsPerWeek + calloutsPerWeek;

  // Lost billable hours = interrupted sessions × session length. Straight arithmetic, their numbers.
  const hoursAtRiskPerWeek = interruptionEvents * input.sessionLengthHours;
  const weeklyRevenueAtRisk = hoursAtRiskPerWeek * input.reimbursementPerHour;

  // Operational drag tied to those interruptions (admin scramble + note cleanup), clinic-estimated.
  const documentationCleanupHours =
    interruptionEvents * cleanupHoursPerSession[input.documentationCleanupFrequency];
  const adminHoursSpent =
    (interruptionEvents * input.adminMinutesPerCancellation) / 60 + documentationCleanupHours;

  // Clean-claims at risk: a share of billable hours is exposed to denial/recoupment when notes are
  // late or missing. Illustrative; validate against payer mix. (No claim that software fixes it here.)
  const monthlyScheduledHours = scheduledHoursPerWeek * 4;
  const lateNoteShare = (input.lateNoteRate ?? 0) / 100;
  const inferredLateShare =
    lateNoteShare > 0
      ? lateNoteShare
      : input.documentationCleanupFrequency === "often"
        ? 0.06
        : input.documentationCleanupFrequency === "sometimes"
          ? 0.03
          : 0.015;
  const atRiskClaimDollarsMonthly = monthlyScheduledHours * inferredLateShare * input.reimbursementPerHour;

  return {
    scheduledSessionsPerWeek,
    scheduledHoursPerWeek,
    cancellationsPerWeek,
    calloutsPerWeek,
    hoursAtRiskPerWeek,
    weeklyRevenueAtRisk,
    monthlyHoursAtRisk: hoursAtRiskPerWeek * 4,
    monthlyRevenueLeakage: weeklyRevenueAtRisk * 4,
    annualRevenueLeakage: weeklyRevenueAtRisk * 52,
    adminHoursSpent,
    documentationCleanupHours,
    monthlyAdminHours: adminHoursSpent * 4,
    atRiskClaimDollarsMonthly,
    summary: buildSummary(hoursAtRiskPerWeek, weeklyRevenueAtRisk, weeklyRevenueAtRisk * 52)
  };
}

function buildSummary(hoursAtRiskPerWeek: number, weeklyRevenueAtRisk: number, annualRevenueAtRisk: number) {
  const roundedHours = Math.round(hoursAtRiskPerWeek * 10) / 10;
  const roundedWeekly = Math.round(weeklyRevenueAtRisk);
  const roundedAnnual = Math.round(annualRevenueAtRisk);
  return `About ${roundedHours} billable hours slip away each week — roughly $${roundedWeekly.toLocaleString()} in weekly revenue, or about $${roundedAnnual.toLocaleString()} a year in unrecovered hours.`;
}
