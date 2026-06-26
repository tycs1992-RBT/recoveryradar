import { describe, expect, it } from "vitest";
import { calculateLostHours, type CalculatorInput } from "@/lib/calculator";

const input: CalculatorInput = {
  clients: 50,
  sessionsPerClientPerWeek: 2,
  sessionLengthHours: 1.5,
  cancellationRate: 20,
  calloutRate: 8,
  reimbursementPerHour: 75,
  currentRecoveryRate: 20,
  adminMinutesPerCancellation: 12,
  documentationCleanupFrequency: "sometimes",
  recoveryWorkflowMaturity: "manual",
  rbtCount: 25,
  lateNoteRate: 0,
  contactName: "",
  role: "",
  clinicName: "",
  email: "",
  currentEmr: "",
  consentToContact: false
};

describe("calculateLostHours", () => {
  it("calculates scheduled sessions and hours at risk", () => {
    const result = calculateLostHours(input);
    expect(result.scheduledSessionsPerWeek).toBe(100);
    expect(result.hoursAtRiskPerWeek).toBe(42);
    expect(result.monthlyHoursAtRisk).toBe(168);
    expect(result.monthlyRevenueLeakage).toBe(12600);
  });


  it("calculates admin time from disrupted sessions and documentation cleanup", () => {
    const result = calculateLostHours(input);
    expect(result.documentationCleanupHours).toBe(14);
    expect(result.adminHoursSpent).toBeCloseTo(19.6, 5);
  });

  it("recommends recovery modules for high cancellation and callout rates", () => {
    const result = calculateLostHours(input);
    expect(result.recommendedModules).toContain("Scheduler AI™");
    expect(result.recommendedModules).toContain("SubPool™ Marketplace");
    expect(result.recommendedModules).toContain("Compliance Sentinel™");
  });
});
