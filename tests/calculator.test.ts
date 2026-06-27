import { describe, expect, it } from "vitest";
import { calculateLostHours, type CalculatorInput } from "@/lib/calculator";

const baseInput: CalculatorInput = {
  clients: 50,
  sessionsPerClientPerWeek: 2,
  sessionLengthHours: 1.5,
  cancellationRate: 15,
  calloutRate: 8,
  reimbursementPerHour: 75,
  adminMinutesPerCancellation: 12,
  documentationCleanupFrequency: "sometimes",
  lateNoteRate: 0,
  contactName: "",
  role: "",
  clinicName: "",
  email: "",
  currentEmr: "",
  consentToContact: false
};

describe("calculateLostHours (bleed-only)", () => {
  it("computes lost billable hours and revenue from the clinic's own numbers", () => {
    const r = calculateLostHours(baseInput);
    // 50 clients * 2 sessions = 100 scheduled/wk; (15%+8%) interrupted = 23 events; *1.5h = 34.5h
    expect(r.hoursAtRiskPerWeek).toBeCloseTo(34.5, 1);
    expect(r.weeklyRevenueAtRisk).toBeCloseTo(34.5 * 75, 1);
    expect(r.monthlyRevenueLeakage).toBeCloseTo(r.weeklyRevenueAtRisk * 4, 1);
    expect(r.annualRevenueLeakage).toBeCloseTo(r.weeklyRevenueAtRisk * 52, 1);
  });

  it("scales the bleed with cancellation rate", () => {
    const low = calculateLostHours({ ...baseInput, cancellationRate: 5 });
    const high = calculateLostHours({ ...baseInput, cancellationRate: 30 });
    expect(high.weeklyRevenueAtRisk).toBeGreaterThan(low.weeklyRevenueAtRisk);
  });

  it("sizes at-risk billing from late notes without assuming any fix", () => {
    const r = calculateLostHours({ ...baseInput, lateNoteRate: 10 });
    expect(r.atRiskClaimDollarsMonthly).toBeGreaterThan(0);
  });

  it("makes no recovery or retention claim", () => {
    const r = calculateLostHours(baseInput) as Record<string, unknown>;
    expect(r.potentialRecoveredHours10).toBeUndefined();
    expect(r.recommendedModules).toBeUndefined();
    expect(r.annualTurnoverCostContext).toBeUndefined();
  });
});
