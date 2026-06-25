import { z } from "zod";

export const quizSchema = z.object({
  currentSystem: z.string(),
  biggestPain: z.string(),
  cancellationWorkflow: z.string(),
  calloutWorkflow: z.string(),
  billExportReadiness: z.string(),
  caregiverCommunication: z.string(),
  emrSolvesRecovery: z.string(),
  shoppingTimeline: z.string(),
  locations: z.string().optional().default("single")
});

export type QuizResponse = z.infer<typeof quizSchema>;

export type PersonaSegment =
  | "emr_shopper"
  | "recovery_layer_candidate"
  | "staff_support_candidate"
  | "documentation_readiness_candidate"
  | "new_clinic_stack_builder"
  | "multi_location_operations_candidate";

export type QuizResult = {
  personaSegment: PersonaSegment;
  segmentLabel: string;
  primaryPain: string;
  hiddenIssues: string[];
  recommendedModules: string[];
  cta: string;
  demoPath: string;
};

const mainstreamSystems = ["CentralReach", "Rethink", "Motivity", "Catalyst", "ATrack", "Hi Rasmus"];

export const quizQuestions = [
  {
    key: "currentSystem",
    question: "What system do you use today?",
    options: ["CentralReach", "Rethink", "Motivity", "Catalyst", "ATrack", "Hi Rasmus", "Spreadsheets", "Other", "Not sure"]
  },
  {
    key: "biggestPain",
    question: "What is your biggest operational pain?",
    options: [
      "scheduling",
      "cancellations",
      "RBT callouts",
      "caregiver communication",
      "documentation cleanup",
      "billing/export readiness",
      "authorization tracking",
      "staff retention",
      "all of the above"
    ]
  },
  {
    key: "cancellationWorkflow",
    question: "What happens after a caregiver cancellation?",
    options: [
      "manual calls/texts",
      "scheduler searches manually",
      "wait for family to reschedule",
      "no formal recovery workflow",
      "some recovery process",
      "automated route"
    ]
  },
  {
    key: "calloutWorkflow",
    question: "Do RBT callouts trigger a structured coverage workflow?",
    options: ["yes", "no", "sometimes", "depends on scheduler"]
  },
  {
    key: "billExportReadiness",
    question: "Can your team see whether a recovered session is ready to bill/export?",
    options: ["yes", "no", "partially", "only after manual review"]
  },
  {
    key: "caregiverCommunication",
    question: "Do caregivers get secure recovery/makeup communication?",
    options: ["yes", "no", "manually", "inconsistent"]
  },
  {
    key: "emrSolvesRecovery",
    question: "Does your current EMR solve recovery routing?",
    options: ["yes", "no", "partially", "not sure"]
  },
  {
    key: "shoppingTimeline",
    question: "Are you actively shopping for software?",
    options: ["yes, immediately", "within 3 months", "within 6 months", "just researching", "no, but exploring overlays"]
  },
  {
    key: "locations",
    question: "How many locations are you operating or planning?",
    options: ["single", "two to four", "five plus", "opening first clinic"]
  }
] as const;

export function segmentQuizResponse(response: QuizResponse): QuizResult {
  const pain = response.biggestPain;
  const hiddenIssues: string[] = [];
  const modules = new Set<string>();

  const isShoppingSoon = ["yes, immediately", "within 3 months"].includes(response.shoppingTimeline);
  const isShoppingWithinSix = response.shoppingTimeline === "within 6 months";
  const usesMainstream = mainstreamSystems.includes(response.currentSystem);
  const noRecovery = ["no formal recovery workflow", "manual calls/texts", "scheduler searches manually", "wait for family to reschedule"].includes(
    response.cancellationWorkflow
  );
  const calloutPain = ["RBT callouts", "staff retention", "all of the above"].includes(pain);
  const documentationPain = ["documentation cleanup", "billing/export readiness", "authorization tracking", "all of the above"].includes(pain);
  const multiLocation = ["two to four", "five plus"].includes(response.locations ?? "single");

  if (response.emrSolvesRecovery !== "yes") {
    hiddenIssues.push("Your EMR may be storing the schedule, but not actively routing recovery after disruptions.");
  }
  if (noRecovery) {
    hiddenIssues.push("Manual or informal recovery creates leakage when cancellations happen faster than staff can respond.");
  }
  if (["no", "depends on scheduler", "sometimes"].includes(response.calloutWorkflow)) {
    hiddenIssues.push("Callout coverage appears dependent on scheduler memory or manual escalation.");
  }
  if (["no", "partially", "only after manual review"].includes(response.billExportReadiness)) {
    hiddenIssues.push("Recovered sessions may still need a readiness check before billing/export.");
  }

  let personaSegment: PersonaSegment;

  if (["Spreadsheets", "Other", "Not sure"].includes(response.currentSystem) || response.locations === "opening first clinic") {
    personaSegment = "new_clinic_stack_builder";
    modules.add("Scheduler AI™");
    modules.add("Auth Utilization War Room™");
    modules.add("API Integration Hub™");
  } else if (multiLocation && (isShoppingWithinSix || pain === "all of the above")) {
    personaSegment = "multi_location_operations_candidate";
    modules.add("Scheduler AI™");
    modules.add("SubPool™ Marketplace");
    modules.add("Compliance Sentinel™");
    modules.add("API Integration Hub™");
  } else if (isShoppingSoon && response.emrSolvesRecovery !== "yes") {
    personaSegment = "emr_shopper";
    modules.add("Scheduler AI™");
    modules.add("SubPool™ Marketplace");
    modules.add("Auth Utilization War Room™");
  } else if (calloutPain) {
    personaSegment = "staff_support_candidate";
    modules.add("SubPool™ Marketplace");
    modules.add("FieldPocket™");
    modules.add("Care Pocket™");
  } else if (documentationPain) {
    personaSegment = "documentation_readiness_candidate";
    modules.add("Compliance Sentinel™");
    modules.add("Auth Utilization War Room™");
    modules.add("API Integration Hub™");
  } else if (usesMainstream && noRecovery) {
    personaSegment = "recovery_layer_candidate";
    modules.add("Scheduler AI™");
    modules.add("SubPool™ Marketplace");
    modules.add("Care Pocket™");
  } else {
    personaSegment = "recovery_layer_candidate";
    modules.add("Scheduler AI™");
    modules.add("Compliance Sentinel™");
  }

  const segmentCopy = segmentMetadata[personaSegment];

  return {
    personaSegment,
    segmentLabel: segmentCopy.label,
    primaryPain: pain,
    hiddenIssues,
    recommendedModules: Array.from(modules),
    cta: segmentCopy.cta,
    demoPath: segmentCopy.demoPath
  };
}

export const segmentMetadata: Record<PersonaSegment, { label: string; cta: string; demoPath: string }> = {
  emr_shopper: {
    label: "EMR Shopper",
    cta: "Before you switch EMRs, calculate your lost hours and watch the Scheduler AI™ + SubPool™ recovery demo.",
    demoPath: "/aba-emr-alternative"
  },
  recovery_layer_candidate: {
    label: "Recovery Layer Candidate",
    cta: "Add Infinite Suite OS™ beside your current EMR and watch the recovery workflow demo.",
    demoPath: "/aba-cancellation-recovery"
  },
  staff_support_candidate: {
    label: "Staff Support Candidate",
    cta: "Explore SubPool™ Marketplace and FieldPocket™ for callout coverage and field support.",
    demoPath: "/rbt-callout-coverage"
  },
  documentation_readiness_candidate: {
    label: "Documentation Readiness Candidate",
    cta: "See Compliance Sentinel™ and Auth Utilization War Room™ for review-ready recovered sessions.",
    demoPath: "/aba-scheduling-recovery"
  },
  new_clinic_stack_builder: {
    label: "New Clinic Stack Builder",
    cta: "Download the ABA Clinic Startup Stack checklist and take the Lost Hours Calculator.",
    demoPath: "/new-aba-clinic-software-stack"
  },
  multi_location_operations_candidate: {
    label: "Multi-Location Operations Candidate",
    cta: "Book a consultation to discuss multi-location recovery workflows and authorization visibility.",
    demoPath: "/founding-clinic-beta"
  }
};
