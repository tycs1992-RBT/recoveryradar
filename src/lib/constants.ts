export const coreMessage =
  "Keep your current EMR. Add Infinite Suite beside it so the care your clients are already approved for actually gets delivered when sessions cancel — and so you can see it's producing progress, not just hours. Support staff and caregivers with cleaner, review-ready documentation. Infinite never sets or recommends a child's hours; the BCBA owns the plan.";

export const primaryCta =
  "Go to demo.infinitepieces.ai, review the lost-hours homepage, then click Provider Portal to enter the mock operating system.";

export const coreModules = [
  {
    name: "Scheduler AI™",
    shortName: "Scheduler AI",
    description: "Detects cancellation and makeup-session opportunities before authorized hours disappear.",
    bestFor: ["cancellations", "manual scheduling", "makeup sessions"]
  },
  {
    name: "SubPool™ Marketplace",
    shortName: "SubPool",
    description: "Routes callout coverage opportunities to eligible staff for faster recovery.",
    bestFor: ["RBT callouts", "coverage gaps", "multi-location staffing"]
  },
  {
    name: "FieldPocket™",
    shortName: "FieldPocket",
    description: "Supports field staff with the context they need for recovered sessions.",
    bestFor: ["field support", "staff confidence", "callout recovery"]
  },
  {
    name: "Care Pocket™",
    shortName: "Care Pocket",
    description: "Keeps caregivers informed through consent-aware recovery and makeup-session communication.",
    bestFor: ["caregiver communication", "makeup coordination", "family updates"]
  },
  {
    name: "Compliance Sentinel™",
    shortName: "Compliance Sentinel",
    description: "Gates session notes (can't end without a signed note; can't start the next session if notes are >24h overdue), flags documentation gaps, and stages proof packets for review-ready operations.",
    bestFor: ["note-gating", "documentation cleanup", "audit readiness", "export readiness"]
  },
  {
    name: "Auth Utilization War Room™",
    shortName: "Auth War Room",
    description: "Helps operators see utilization risk and protect authorized hours before expiration.",
    bestFor: ["authorization tracking", "utilization", "revenue leakage"]
  },
  {
    name: "API Integration Hub™",
    shortName: "API Hub",
    description: "Exports operational recovery data alongside the clinic’s current EMR instead of replacing it.",
    bestFor: ["no migration", "exports", "EMR overlay"]
  }
];

export const navItems = [
  { href: "/dashboard", label: "Dashboard", eyebrow: "Command center" },
  { href: "/lead-machine", label: "Lead Machine", eyebrow: "CSV leads" },
  { href: "/emr-shopping-radar", label: "EMR Shopping Radar", eyebrow: "Live signals" },
  { href: "/executive-prospector", label: "Executive Prospector", eyebrow: "Execs" },
  { href: "/intelligence-bank", label: "Intelligence Bank", eyebrow: "Deduped" },
  { href: "/lead-finder", label: "Social Source Finder", eyebrow: "Signals" },
  { href: "/keyword-radar", label: "Keyword Radar", eyebrow: "SEO + ads" },
  { href: "/seo-command-center", label: "SEO Command Center", eyebrow: "Keywords" },
  { href: "/seo-page-factory", label: "SEO Page Factory", eyebrow: "Publish pages" },
  { href: "/calculator", label: "Calculator", eyebrow: "Public tool" },
  { href: "/quiz", label: "Quiz", eyebrow: "Public tool" },
  { href: "/bot-builder", label: "Bot Builder", eyebrow: "Recovery Advisor" },
  { href: "/crm", label: "CRM Leads", eyebrow: "Pipeline" },
  { href: "/crm-import", label: "CRM Import", eyebrow: "Mapping" },
  { href: "/tasks", label: "Task Inbox", eyebrow: "Follow-up" },
  { href: "/outreach", label: "Outreach", eyebrow: "Templates" },
  { href: "/outreach-approval", label: "Outreach Approval", eyebrow: "Human review" },
  { href: "/content-generator", label: "Content Generator", eyebrow: "AI drafts" },
  { href: "/campaign-planner", label: "Campaign Planner", eyebrow: "Google Ads" },
  { href: "/analytics", label: "Analytics", eyebrow: "Conversion" },
  { href: "/audit-suggestions", label: "Audit Suggestions", eyebrow: "Action board" },
  { href: "/settings", label: "Settings", eyebrow: "Compliance" }
];

export const keywordGroups = [
  {
    groupName: "EMR shoppers",
    keywords: [
      "ABA EMR",
      "ABA EMR software",
      "ABA practice management software",
      "ABA clinic software",
      "ABA billing software",
      "ABA therapy software"
    ],
    landingPage: "/aba-emr-alternative",
    headlines: [
      "Keep Your ABA EMR",
      "Recover Lost ABA Hours",
      "ABA Cancellation Recovery",
      "Before You Switch EMRs",
      "Add Recovery Beside EMR"
    ],
    description:
      "Keep your current EMR. Add Infinite Suite beside it to recover lost hours from cancellations, callouts and staff gaps."
  },
  {
    groupName: "Alternatives",
    keywords: [
      "CentralReach alternative",
      "CentralReach competitor",
      "Rethink alternative",
      "Motivity alternative",
      "Catalyst alternative",
      "ATrack alternative"
    ],
    landingPage: "/centralreach-alternative",
    headlines: [
      "CentralReach Alternative?",
      "Rethink Alternative?",
      "Keep Your EMR",
      "Don’t Migrate Yet",
      "Add Recovery Beside EMR"
    ],
    description:
      "Shopping for new ABA software? Calculate your lost hours before replacing your EMR. Infinite Suite sits beside your system and recovers sessions."
  },
  {
    groupName: "Operations pain",
    keywords: [
      "ABA scheduling software",
      "ABA staff scheduling",
      "ABA cancellation management",
      "ABA caregiver communication software",
      "ABA authorization tracking",
      "ABA documentation software",
      "ABA session note software",
      "ABA clinic operations software"
    ],
    landingPage: "/aba-scheduling-recovery",
    headlines: [
      "Stop Lost ABA Hours",
      "Recover Cancellations",
      "Cut Callout Chaos",
      "Add Recovery Workflow"
    ],
    description:
      "Cancellations and callouts leak revenue. Infinite Suite routes cancelled sessions into recovered, review-ready hours."
  },
  {
    groupName: "New clinics",
    keywords: [
      "how to open an ABA clinic",
      "ABA clinic startup software",
      "ABA practice startup",
      "ABA clinic operations stack",
      "software for new ABA clinic"
    ],
    landingPage: "/new-aba-clinic-software-stack",
    headlines: [
      "New ABA Clinic Stack",
      "Start With Recovery",
      "Build Recovery Workflow",
      "EMR or Recovery Layer?"
    ],
    description:
      "Opening a new clinic? Start with the right operations stack. Calculate lost hours and build a recovery workflow alongside your EMR."
  }
] as const;

export const landingPages = {
  "aba-emr-alternative": {
    metaTitle: "ABA EMR Alternative – Calculate Lost Hours Before Switching",
    metaDescription:
      "Shopping for ABA EMR software? Learn why operational recovery is a better first step. Recover lost hours from cancellations and callouts while keeping your current EMR.",
    hero: "How many hours did your ABA clinic lose last week?",
    subheadline:
      "You don’t need to replace your EMR to recover lost hours. Keep your current EMR and add Infinite Suite beside it.",
    pain:
      "Clinics often blame their EMR when cancellations, callouts, caregiver communication gaps and documentation cleanup are the real operational leak.",
    audience: "ABA owners, founders, clinical directors and operations leaders evaluating practice-management software.",
    primaryCta: "Calculate lost hours",
    secondaryCta: "See recovery workflow",
    formTitle: "Calculate before you migrate"
  },
  "centralreach-alternative": {
    metaTitle: "CentralReach Alternative? Consider Recovery Before Migration",
    metaDescription:
      "Keep CentralReach and add an operational recovery layer for ABA scheduling, callouts, caregiver communication and documentation readiness.",
    hero: "CentralReach alternative? Calculate your lost hours first.",
    subheadline:
      "Infinite Suite OS™ can sit beside CentralReach to recover lost hours instead of forcing a disruptive migration.",
    pain:
      "If the issue is scheduling scramble, callout coverage, caregiver updates or review readiness, replacing your EMR may not solve the root cause.",
    audience: "CentralReach users who want recovery workflow support without a migration project.",
    primaryCta: "Run the calculator",
    secondaryCta: "View Scheduler AI™ demo",
    formTitle: "See what an overlay could recover"
  },
  "aba-scheduling-recovery": {
    metaTitle: "ABA Scheduling Recovery Software – Recover Cancellations and Callouts",
    metaDescription:
      "ABA scheduling software is not enough without a recovery workflow. Route cancellations and callouts into recovered, review-ready hours.",
    hero: "ABA scheduling software is not enough without recovery routing.",
    subheadline:
      "Scheduler AI™ + SubPool™ turn cancellation and callout chaos into structured recovery opportunities.",
    pain:
      "A schedule tells you what was planned. Recovery Radar shows what can still be saved when the plan breaks.",
    audience: "Schedulers, operations managers and clinical leaders managing cancellation and callout volume.",
    primaryCta: "Take the Operations Quiz",
    secondaryCta: "Calculate lost hours",
    formTitle: "Map your scheduling bottleneck"
  },
  "new-aba-clinic-software-stack": {
    metaTitle: "New ABA Clinic Software Stack – Start With Operational Recovery",
    metaDescription:
      "Opening an ABA clinic? Build your EMR, scheduling, billing, staffing and recovery workflow stack from day one.",
    hero: "Opening a new ABA clinic? Build recovery into the stack from day one.",
    subheadline:
      "Use Recovery Radar to choose what belongs in your startup stack before operations become reactive.",
    pain:
      "New clinics can avoid costly process debt by planning how they will recover cancellations, callouts and authorized hours early.",
    audience: "Founders, new clinic operators and founding clinical directors.",
    primaryCta: "Take the Startup Stack Quiz",
    secondaryCta: "Download checklist",
    formTitle: "Build your startup recovery stack"
  },
  "aba-cancellation-recovery": {
    metaTitle: "ABA Cancellation Recovery – Protect Authorized Hours",
    metaDescription:
      "Estimate lost authorized hours from ABA cancellations and callouts. Add a recovery workflow beside your current EMR.",
    hero: "Stop letting ABA cancellations become lost authorized hours.",
    subheadline:
      "Recovery Radar estimates what is at risk and routes missed sessions toward recovery workflows.",
    pain:
      "Cancellation events create a chain reaction: lost hours, lost revenue, scheduler overload, caregiver confusion and staff fatigue.",
    audience: "Clinics with recurring cancellations, no formal makeup workflow or low recovery rates.",
    primaryCta: "Calculate cancellation leakage",
    secondaryCta: "See recovery workflow",
    formTitle: "Estimate your cancellation gap"
  },
  "rbt-callout-coverage": {
    metaTitle: "RBT Callout Coverage Workflow – SubPool™ and FieldPocket™",
    metaDescription:
      "Manage ABA staff callouts with structured coverage routing, field support and caregiver communication workflows.",
    hero: "RBT callouts should trigger a coverage workflow, not a scramble.",
    subheadline:
      "SubPool™ Marketplace and FieldPocket™ help eligible staff cover recovered sessions with better support.",
    pain:
      "Staff callouts often leave schedulers searching manually while caregivers wait and authorized hours slip away.",
    audience: "Operations managers, schedulers and clinical directors dealing with coverage instability.",
    primaryCta: "Explore staff coverage",
    secondaryCta: "Take the quiz",
    formTitle: "Assess your callout workflow"
  },
  "aba-lost-hours-calculator": {
    metaTitle: "ABA Lost Hours Calculator – Estimate Revenue Leakage",
    metaDescription:
      "Calculate weekly and monthly ABA hours at risk from cancellations, callouts and documentation cleanup.",
    hero: "ABA Lost Hours Calculator",
    subheadline:
      "Get an immediate estimate of weekly hours at risk, monthly revenue leakage and recovery potential.",
    pain:
      "Most clinics see missed sessions in separate places. This calculator combines cancellations, callouts, recovery rate and admin load into one view.",
    audience: "ABA clinic operators who want fast operational clarity before buying software.",
    primaryCta: "Start calculator",
    secondaryCta: "Send detailed report",
    formTitle: "Find your lost-hours baseline"
  },
  "founding-clinic-beta": {
    metaTitle: "Founding Clinic Beta – Infinite Suite OS™ Recovery Workflow",
    metaDescription:
      "Join a limited founding clinic beta to test Infinite Suite OS™ recovery workflows beside your existing EMR.",
    hero: "Become a Founding Clinic for Infinite Suite OS™.",
    subheadline:
      "Help shape the no-migration recovery core for ABA operations while testing workflows beside your current EMR.",
    pain:
      "Founding clinics get structured feedback sessions, early access and a clear recovery measurement plan.",
    audience: "Clinics willing to provide structured feedback and anonymized operational recovery metrics.",
    primaryCta: "Apply for beta",
    secondaryCta: "See demo path",
    formTitle: "Request beta consideration"
  }
} as const;

export type LandingPageSlug = keyof typeof landingPages;

export const compliancePrinciples = [
  "Do not collect PHI in the calculator, quiz or chatbot.",
  "Use HIPAA-conscious and privacy-aware language instead of blanket compliance claims.",
  "Use only public company-level information for lead research.",
  "Require human approval before sending outreach.",
  "Include truthful sender details, postal address and opt-out instructions in commercial emails.",
  "Audit access, consent and status changes."
];
