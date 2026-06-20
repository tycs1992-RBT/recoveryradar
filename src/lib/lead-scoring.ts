export type SignalType =
  | "new_clinic"
  | "expanding"
  | "aba_provider"
  | "aba_specific"
  | "founder_role"
  | "owner_role"
  | "ceo_role"
  | "hiring_scheduler"
  | "scheduler_hiring"
  | "hiring_bcba"
  | "multi_location"
  | "operations_pain"
  | "operational_pain"
  | "emr_shopping"
  | "centralreach_alt"
  | "scheduling_issues"
  | "billing_issues"
  | "staffing_shortage"
  | "cancellations"
  | "caregiver_support"
  | "staff_support_mention"
  | "in_home"
  | "hybrid"
  | "regional_provider"
  | "large_enterprise"
  | "non_aba"
  | "non_clinical_charity"
  | "school_only"
  | "do_not_contact";

export type LeadScoringInput = {
  companyName?: string | null;
  contactRole?: string | null;
  clinicSize?: number | null;
  serviceModel?: string | null;
  status?: string | null;
  signals: Array<{ type: SignalType | string; detail?: string | null }>;
};

export type LeadScoreResult = {
  score: number;
  tier: "hot" | "research" | "low" | "do_not_contact";
  reasons: Array<{ label: string; points: number }>;
};

function hasSignal(input: LeadScoringInput, types: SignalType[]) {
  return input.signals.some((signal) => types.includes(signal.type as SignalType));
}

function roleMatches(input: LeadScoringInput, patterns: RegExp[]) {
  const role = input.contactRole ?? "";
  return patterns.some((pattern) => pattern.test(role));
}

export function scoreLead(input: LeadScoringInput): LeadScoreResult {
  const reasons: Array<{ label: string; points: number }> = [];
  const add = (label: string, points: number) => reasons.push({ label, points });

  if (input.status?.toLowerCase().includes("do_not_contact") || hasSignal(input, ["do_not_contact"])) {
    add("Do-not-contact request", -100);
    return { score: 0, tier: "do_not_contact", reasons };
  }

  if (hasSignal(input, ["new_clinic", "expanding"])) {
    add("New clinic, opening or expansion signal", 20);
  }

  if (hasSignal(input, ["aba_provider", "aba_specific"])) {
    add("ABA-specific provider", 20);
  }

  if (hasSignal(input, ["founder_role", "owner_role", "ceo_role"]) || roleMatches(input, [/founder/i, /owner/i, /ceo/i, /president/i])) {
    add("Founder/owner/CEO decision-maker identified", 15);
  }

  if (hasSignal(input, ["hiring_scheduler", "scheduler_hiring"])) {
    add("Operations or scheduling hiring signal", 15);
  }

  if (hasSignal(input, ["multi_location"])) {
    add("Multi-location or franchise growth", 15);
  }

  if (hasSignal(input, ["operations_pain", "operational_pain", "emr_shopping", "centralreach_alt", "scheduling_issues", "billing_issues", "staffing_shortage", "cancellations"])) {
    add("Operational pain mentioned publicly", 10);
  }

  const serviceModel = input.serviceModel?.toLowerCase() ?? "";
  if (hasSignal(input, ["in_home", "hybrid"]) || serviceModel.includes("home") || serviceModel.includes("hybrid")) {
    add("In-home or hybrid service model", 10);
  }

  if (hasSignal(input, ["regional_provider"]) || (input.clinicSize != null && input.clinicSize < 100)) {
    add("Local or regional provider", 10);
  }

  if (hasSignal(input, ["caregiver_support", "staff_support_mention"])) {
    add("Caregiver communication or staff support mentioned", 10);
  }

  if (hasSignal(input, ["large_enterprise"]) || (input.clinicSize != null && input.clinicSize > 1000)) {
    add("Large enterprise provider with longer procurement cycle", -20);
  }

  if (hasSignal(input, ["non_aba", "non_clinical_charity"])) {
    add("Non-ABA organization", -20);
  }

  if (hasSignal(input, ["school_only"]) || serviceModel.includes("school_only") || serviceModel.includes("school-only")) {
    add("School-only services", -20);
  }

  if (input.signals.length === 0) {
    add("No evidence of operations, expansion or software shopping", -30);
  }

  const rawScore = reasons.reduce((sum, reason) => sum + reason.points, 0);
  const score = Math.max(0, Math.min(100, rawScore));
  const tier = score >= 60 ? "hot" : score >= 30 ? "research" : "low";

  return { score, tier, reasons };
}

export function explainScore(result: LeadScoreResult) {
  return result.reasons
    .map((reason) => `${reason.points > 0 ? "+" : ""}${reason.points}: ${reason.label}`)
    .join("\n");
}

export type LeadRecordLike = {
  companyName?: string | null;
  contactRole?: string | null;
  clinicSize?: number | null;
  serviceModel?: string | null;
  status?: string | null;
};

export type IntentSignalRecordLike = {
  signalType?: string | null;
  signalDetail?: string | null;
};

const signalAliases: Record<string, SignalType> = {
  aba_specific: "aba_provider",
  aba_specific_provider: "aba_provider",
  operational_pain: "operations_pain",
  operations_pain: "operations_pain",
  scheduler_hiring: "hiring_scheduler",
  staff_support_mention: "caregiver_support",
  caregiver_communication: "caregiver_support",
  non_clinical_charity: "non_aba",
  centralreach_alt: "operations_pain",
  centralreach_alternative: "operations_pain",
  emr_migration: "operations_pain",
  emr_dissatisfaction: "operations_pain",
  hiring_scheduler: "hiring_scheduler",
  hiring_bcba: "hiring_bcba",
  new_clinic: "new_clinic",
  expanding: "expanding",
  multi_location: "multi_location",
  school_only: "school_only",
  do_not_contact: "do_not_contact"
};

function normalizeSignalType(type?: string | null): SignalType | string {
  const key = (type ?? "public_interest_signal").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return signalAliases[key] ?? key;
}

export function scoreLeadFromRecords(lead: LeadRecordLike, signals: IntentSignalRecordLike[] = []): LeadScoreResult {
  return scoreLead({
    companyName: lead.companyName,
    contactRole: lead.contactRole,
    clinicSize: lead.clinicSize,
    serviceModel: lead.serviceModel,
    status: lead.status,
    signals: signals.map((signal) => ({
      type: normalizeSignalType(signal.signalType),
      detail: signal.signalDetail
    }))
  });
}

export function calculateLeadScore(lead: LeadRecordLike, signals: IntentSignalRecordLike[] = []): number {
  return scoreLeadFromRecords(lead, signals).score;
}
