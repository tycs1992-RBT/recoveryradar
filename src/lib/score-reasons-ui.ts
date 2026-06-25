import { scoreLead, type LeadScoreResult } from "@/lib/lead-scoring";

export type ScoreReasonDisplayInput = {
  companyName?: string | null;
  contactRole?: string | null;
  clinicSize?: number | null;
  serviceModel?: string | null;
  status?: string | null;
  sourceSignal?: string | null;
  painPoint?: string | null;
  title?: string | null;
  snippet?: string | null;
};

function text(input: ScoreReasonDisplayInput) {
  return [input.companyName, input.contactRole, input.serviceModel, input.sourceSignal, input.painPoint, input.title, input.snippet].filter(Boolean).join(" ").toLowerCase();
}

export function scoreReasonsForDisplay(input: ScoreReasonDisplayInput): LeadScoreResult {
  const content = text(input);
  const signals: Array<{ type: string; detail?: string }> = [];

  if (/aba|bcba|rbt|autism/.test(content)) signals.push({ type: "aba_provider", detail: "ABA-specific language detected" });
  if (/founder|owner|ceo|president|director/.test(content)) signals.push({ type: "founder_role", detail: "Decision-maker role language" });
  if (/new clinic|opening|expanding|new location/.test(content)) signals.push({ type: "new_clinic", detail: "New clinic or expansion signal" });
  if (/centralreach|rethink|motivity|catalyst|atrack|emr|ehr|migration|alternative|replacement|switching/.test(content)) signals.push({ type: "emr_shopping", detail: "EMR/software shopping signal" });
  if (/cancellation|cancelation|callout|makeup|scheduling|billing|authorization|utilization|documentation|caregiver|problem|issue|frustrated|recommend/.test(content)) signals.push({ type: "operations_pain", detail: "Operational pain or shopping language" });
  if (/caregiver|parent|family|staff support|rbt support/.test(content)) signals.push({ type: "caregiver_support", detail: "Caregiver/staff support language" });
  if (/school only|school-only/.test(content)) signals.push({ type: "school_only", detail: "School-only signal" });
  if (/do not contact|unsubscribe|remove me/.test(content) || input.status === "DO_NOT_CONTACT") signals.push({ type: "do_not_contact", detail: "Suppression language" });

  return scoreLead({
    companyName: input.companyName,
    contactRole: input.contactRole,
    clinicSize: input.clinicSize,
    serviceModel: input.serviceModel,
    status: input.status,
    signals
  });
}

export function formatScoreReasons(result: LeadScoreResult) {
  return result.reasons.map((reason) => `${reason.points > 0 ? "+" : ""}${reason.points} ${reason.label}`);
}
