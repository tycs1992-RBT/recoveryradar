import { describe, expect, it } from "vitest";
import { validateOutreachDraft } from "@/lib/compliance";

describe("validateOutreachDraft", () => {
  it("accepts no-migration email drafts with opt-out language", () => {
    const result = validateOutreachDraft(
      "Keep your current EMR and add Infinite Suite beside it. Reply unsubscribe to opt out.",
      "email"
    );

    expect(result.passed).toBe(true);
  });

  it("rejects blanket HIPAA compliant claims", () => {
    const result = validateOutreachDraft(
      "Our product is HIPAA compliant and will replace your EMR.",
      "email"
    );

    expect(result.passed).toBe(false);
  });
});
