export type BotOption = {
  label: string;
  value: string;
};

export type BotNode = {
  id: string;
  message: string;
  options?: BotOption[];
  ctaHref?: string;
  ctaLabel?: string;
  captureLead?: boolean;
};

const defaultKeywordCTA =
  "Most ABA software searches start with: Which EMR should we use? The deeper question may be: how many authorized hours are disappearing from cancellations, callouts, coverage gaps, caregiver communication issues and documentation cleanup? Start with the Lost Hours Calculator, then tour the mock recovery OS.";

export const botOpening: BotNode = {
  id: "opening",
  message:
    "Hi! I can help with ABA software buying questions, EMR replacement searches, cancellation recovery, RBT callout coverage, caregiver communication, documentation readiness, and new clinic startup stacks. Please do not share patient information here.",
  options: [
    { label: "I’m shopping for ABA software/EMR", value: "emr_shopping" },
    { label: "I’m comparing CentralReach/Rethink/Motivity", value: "competitor_replacement" },
    { label: "I’m struggling with cancellations", value: "cancellations" },
    { label: "I need staff coverage help", value: "staff_coverage" },
    { label: "I need caregiver communication help", value: "caregiver" },
    { label: "I need cleaner documentation workflows", value: "documentation" },
    { label: "I’m opening a new ABA clinic", value: "new_clinic" },
    { label: "I want to see the demo", value: "demo" }
  ]
};

export const botNodes: Record<string, BotNode> = {
  opening: botOpening,
  emr_shopping: {
    id: "emr_shopping",
    message:
      `You may not need to replace your EMR first. Keywords like ABA EMR software, best EMR for ABA therapy, ABA EHR software, ABA practice management system and ABA EMR comparison should route to this answer: calculate how many hours are being lost in operational recovery gaps.\n\n${defaultKeywordCTA}`,
    options: [
      { label: "Calculate lost hours", value: "open_calculator" },
      { label: "See recovery workflow", value: "see_workflow" },
      { label: "Compare migration vs recovery", value: "emr_resources" }
    ]
  },
  competitor_replacement: {
    id: "competitor_replacement",
    message:
      "Before switching systems, see whether the real pain is EMR functionality or the lost-hours workflow around cancellations, callouts, coverage, caregiver communication and documentation readiness. This is the angle for CentralReach alternative, RethinkBH alternative, Motivity alternative, Catalyst ABA alternative, Hi Rasmus alternative and ATrack alternative searches.",
    options: [
      { label: "Calculate lost hours", value: "open_calculator" },
      { label: "Compare migration vs recovery", value: "emr_resources" },
      { label: "Request walkthrough", value: "capture" }
    ]
  },
  cancellations: {
    id: "cancellations",
    message:
      "A cancellation should not automatically become a lost hour. Infinite Suite OS™ routes the recovery workflow beside your current EMR. This is the angle for ABA cancellation management software, ABA makeup session software, ABA session recovery software and recover lost ABA hours.",
    options: [
      { label: "Open Lost Hours Calculator", value: "open_calculator" },
      { label: "View Scheduler AI™ demo", value: "see_workflow" },
      { label: "Take the Operations Quiz", value: "open_quiz" }
    ]
  },
  staff_coverage: {
    id: "staff_coverage",
    message:
      "RBT callouts and staff coverage gaps should trigger a structured recovery workflow, not scheduler scramble. This is the angle for ABA staff coverage software, RBT callout coverage, RBT scheduling software, RBT support software and ABA staff retention software.",
    options: [
      { label: "Learn about staff coverage", value: "staff_page" },
      { label: "Calculate lost hours", value: "open_calculator" },
      { label: "Contact us", value: "capture" }
    ]
  },
  caregiver: {
    id: "caregiver",
    message:
      "Care Pocket™ keeps families informed through consent-aware recovery communication. This is the angle for ABA caregiver communication software, parent communication software for ABA clinics, ABA parent portal software and ABA makeup session communication. Do not enter patient information in public forms or chat.",
    options: [
      { label: "See Care Pocket™ demo", value: "see_workflow" },
      { label: "Request walkthrough", value: "capture" }
    ]
  },
  documentation: {
    id: "documentation",
    message:
      "Recovery is not complete until the recovered session is ready for review/export. This is the angle for ABA documentation software, ABA audit documentation software, ABA compliance software, ABA proof packet and ABA payer audit documentation. Use audit-readiness language, not compliance guarantees.",
    options: [
      { label: "View documentation workflow", value: "documentation_page" },
      { label: "Calculate lost hours", value: "open_calculator" }
    ]
  },
  new_clinic: {
    id: "new_clinic",
    message:
      "Build the clinic stack around recovery from day one: cancellations, callouts, staff coverage, caregiver communication and review-ready documentation. This is the angle for software for new ABA clinic, ABA clinic startup software, ABA software for startups and BCBA starting ABA clinic.",
    options: [
      { label: "Take the Startup Stack Quiz", value: "open_quiz" },
      { label: "Open startup stack", value: "new_clinic_page" },
      { label: "Request walkthrough", value: "capture" }
    ]
  },
  demo: {
    id: "demo",
    message:
      "Great! Start with the calculator, then click Provider Portal to tour the mock recovery OS. Would you like a follow-up walkthrough?",
    options: [
      { label: "Open calculator", value: "open_calculator" },
      { label: "Email me the demo link", value: "capture" }
    ]
  },
  open_calculator: {
    id: "open_calculator",
    message: "Open the Lost Hours Calculator for an immediate estimate. Use clinic-level numbers only and do not enter PHI.",
    ctaHref: "/calculator",
    ctaLabel: "Open calculator"
  },
  open_quiz: {
    id: "open_quiz",
    message: "Take the ABA Operations Stack Quiz to get a recommended module path and demo route.",
    ctaHref: "/quiz",
    ctaLabel: "Take quiz"
  },
  see_workflow: {
    id: "see_workflow",
    message:
      "The recovery workflow is: Cancellation → Scheduler AI™ → Auth War Room → SubPool™ → FieldPocket™ → Care Pocket™ → Compliance Sentinel™ → API Hub export.",
    ctaHref: "/aba-scheduling-recovery",
    ctaLabel: "See workflow"
  },
  staff_page: {
    id: "staff_page",
    message: "SubPool™ and FieldPocket™ focus on eligible coverage, field support and less manual scheduler scramble.",
    ctaHref: "/aba-staff-coverage-software",
    ctaLabel: "Explore staff coverage"
  },
  documentation_page: {
    id: "documentation_page",
    message: "Review documentation readiness gaps and see how Compliance Sentinel™ can stage recovered sessions for review.",
    ctaHref: "/aba-documentation-software",
    ctaLabel: "View documentation workflow"
  },
  new_clinic_page: {
    id: "new_clinic_page",
    message: "Start with an operations stack that includes EMR, scheduling, billing, staffing and recovery workflows from day one.",
    ctaHref: "/new-aba-clinic-software-stack",
    ctaLabel: "Open startup stack"
  },
  emr_resources: {
    id: "emr_resources",
    message:
      "You can still research EMR options. Our recommendation is to calculate lost hours first so you know whether replacement or an overlay is the real need.",
    ctaHref: "/aba-emr-alternative",
    ctaLabel: "Compare migration vs recovery"
  },
  capture: {
    id: "capture",
    message:
      "Would you like a personalized report or walkthrough? Share your name, role, clinic name and email. We respect your privacy and will not collect patient information. By providing your email, you agree we may contact you about Infinite Suite OS™.",
    captureLead: true
  }
};

export function getBotNode(value?: string | null) {
  if (!value) return botOpening;
  return botNodes[value] ?? botOpening;
}
