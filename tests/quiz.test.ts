import { describe, expect, it } from "vitest";
import { segmentQuizResponse } from "@/lib/quiz";

describe("segmentQuizResponse", () => {
  it("segments urgent shoppers as EMR shoppers", () => {
    const result = segmentQuizResponse({
      currentSystem: "CentralReach",
      biggestPain: "all of the above",
      cancellationWorkflow: "no formal recovery workflow",
      calloutWorkflow: "depends on scheduler",
      billExportReadiness: "only after manual review",
      caregiverCommunication: "inconsistent",
      emrSolvesRecovery: "no",
      shoppingTimeline: "within 3 months",
      locations: "single"
    });

    expect(result.personaSegment).toBe("emr_shopper");
  });

  it("segments spreadsheets users as new clinic stack builders", () => {
    const result = segmentQuizResponse({
      currentSystem: "Spreadsheets",
      biggestPain: "scheduling",
      cancellationWorkflow: "no formal recovery workflow",
      calloutWorkflow: "no",
      billExportReadiness: "no",
      caregiverCommunication: "manually",
      emrSolvesRecovery: "not sure",
      shoppingTimeline: "just researching",
      locations: "opening first clinic"
    });

    expect(result.personaSegment).toBe("new_clinic_stack_builder");
  });
});
