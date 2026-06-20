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

export const botOpening: BotNode = {
  id: "opening",
  message: "Hi! I can help you understand lost ABA hours, recovery workflows, scheduling/callout operations, caregiver communication and the Infinite Suite OS™ demo. Are you shopping for software, or trying to recover lost hours beside the system you already use? Please do not share patient information here.",
  options: [
    { label: "I’m shopping for ABA software/EMR", value: "emr_shopping" },
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
      "Before you decide, many clinics find that their current EMR isn’t the root cause of lost hours. Have you calculated your lost hours from cancellations and callouts?",
    options: [
      { label: "Calculate lost hours", value: "open_calculator" },
      { label: "See recovery workflow", value: "see_workflow" },
      { label: "Proceed to EMR replacement resources", value: "emr_resources" }
    ]
  },
  cancellations: {
    id: "cancellations",
    message:
      "Cancellations can lead to lost authorized hours. Scheduler AI™ and SubPool™ route cancelled sessions into recovered sessions. Would you like to see how it works?",
    options: [
      { label: "View Scheduler AI™ demo", value: "see_workflow" },
      { label: "Take the Operations Quiz", value: "open_quiz" }
    ]
  },
  staff_coverage: {
    id: "staff_coverage",
    message:
      "RBT callouts and staff shortages can be painful. SubPool™ Marketplace and FieldPocket™ help you find eligible staff and support them in the field.",
    options: [
      { label: "Learn about staff coverage", value: "staff_page" },
      { label: "Contact us", value: "capture" }
    ]
  },
  caregiver: {
    id: "caregiver",
    message:
      "Care Pocket™ provides secure updates and recovery communication for caregivers. The workflow is consent-aware and should never include patient details in this public chat.",
    options: [{ label: "See Care Pocket™ demo", value: "see_workflow" }]
  },
  documentation: {
    id: "documentation",
    message:
      "Compliance Sentinel™ checks documentation and helps teams prepare review-ready proof packets. It works beside your EMR.",
    options: [{ label: "View Compliance Sentinel™ overview", value: "documentation_page" }]
  },
  new_clinic: {
    id: "new_clinic",
    message:
      "Congrats! You may not need a full EMR replacement yet. Start by understanding your operations stack and recovery workflow.",
    options: [
      { label: "Take the Startup Stack Quiz", value: "open_quiz" },
      { label: "Download stack checklist", value: "new_clinic_page" }
    ]
  },
  demo: {
    id: "demo",
    message:
      "Great! Start at the homepage and click Provider Portal to enter the mock OS. Would you like me to send you the link by email?",
    options: [{ label: "Email me the demo link", value: "capture" }]
  },
  open_calculator: {
    id: "open_calculator",
    message: "Open the Lost Hours Calculator for an immediate estimate. You can optionally request a detailed report by email.",
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
    ctaHref: "/rbt-callout-coverage",
    ctaLabel: "Explore staff coverage"
  },
  documentation_page: {
    id: "documentation_page",
    message: "Review documentation readiness gaps and see how Compliance Sentinel™ can stage recovered sessions for review.",
    ctaHref: "/aba-scheduling-recovery",
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
