import { describe, expect, it } from "vitest";
import { calculateLeadScore, scoreLead } from "@/lib/lead-scoring";

describe("scoreLead", () => {
  it("scores a regional expanding ABA provider as hot", () => {
    const result = scoreLead({
      companyName: "Bright Beginnings ABA",
      contactRole: "Founder/CEO",
      clinicSize: 42,
      serviceModel: "hybrid",
      signals: [
        { type: "new_clinic" },
        { type: "aba_provider" },
        { type: "hiring_scheduler" },
        { type: "operations_pain" },
        { type: "caregiver_support" }
      ]
    });

    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.tier).toBe("hot");
  });


  it("supports audit-suggestion signal aliases", () => {
    const result = scoreLead({
      companyName: "Alias ABA",
      contactRole: "Owner",
      clinicSize: 40,
      serviceModel: "in-home",
      signals: [
        { type: "aba_specific" },
        { type: "scheduler_hiring" },
        { type: "operational_pain" },
        { type: "staff_support_mention" }
      ]
    });

    expect(result.score).toBeGreaterThanOrEqual(60);
  });


  it("supports audit-style Prisma record scoring adapter", () => {
    const score = calculateLeadScore(
      { companyName: "Audit ABA", contactRole: "Owner", clinicSize: 45, serviceModel: "hybrid" },
      [
        { signalType: "new_clinic", signalDetail: "Opening new center" },
        { signalType: "aba_specific", signalDetail: "ABA provider" },
        { signalType: "operational_pain", signalDetail: "Scheduling pain" },
        { signalType: "staff_support_mention", signalDetail: "Callout support" }
      ]
    );

    expect(score).toBeGreaterThanOrEqual(60);
  });

  it("respects do-not-contact", () => {
    const result = scoreLead({
      companyName: "Opted Out ABA",
      status: "do_not_contact",
      signals: [{ type: "aba_provider" }]
    });

    expect(result.score).toBe(0);
    expect(result.tier).toBe("do_not_contact");
  });
});
