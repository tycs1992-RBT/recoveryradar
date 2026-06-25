import { landingPages } from "./constants";

export type SEOLandingPage = {
  metaTitle: string;
  metaDescription: string;
  hero: string;
  subheadline: string;
  pain: string;
  audience: string;
  primaryCta: string;
  secondaryCta: string;
  formTitle: string;
};

export type SEOPageBrief = {
  slug: string;
  path: string;
  cluster: string;
  targetKeywords: string[];
  title: string;
  h1: string;
  metaDescription: string;
  contentAngle: string;
  pageSections: string[];
  faqQuestions: string[];
  internalLinks: string[];
};

export const seoPageCatalog: SEOPageBrief[] = [
  {
    slug: "aba-clinic-software",
    path: "/aba-clinic-software",
    cluster: "Commercial software/service",
    targetKeywords: ["ABA clinic software", "ABA therapy software", "ABA practice management software", "ABA practice management system", "ABA clinic management software", "autism therapy software", "behavioral health ABA software"],
    title: "ABA Clinic Software for Lost-Hour Recovery",
    h1: "ABA Clinic Software That Helps Recover Missed Sessions",
    metaDescription: "Explore ABA clinic software built as an operational recovery layer beside your EMR. Recover missed hours from cancellations, callouts and workflow gaps.",
    contentAngle: "Commercial software page for buyers comparing ABA clinic software but not ready for a full EMR migration.",
    pageSections: ["Keep your current EMR", "Recover missed authorized hours", "Unlimited staff and caregiver seats", "Founding Clinic Trial pricing"],
    faqQuestions: ["Is Infinite Suite OS an EMR replacement?", "How does active-learner pricing work?", "Can staff and caregivers access it without seat fees?"],
    internalLinks: ["/calculator", "/provider-portal", "/founding-clinic-beta", "/aba-emr-alternative"]
  },
  {
    slug: "aba-emr-comparison",
    path: "/aba-emr-comparison",
    cluster: "EMR shopper",
    targetKeywords: ["ABA EMR software", "ABA EHR software", "best EMR for ABA therapy", "ABA EMR comparison", "best ABA EMR alternative"],
    title: "ABA EMR Comparison: Migration vs Recovery Layer",
    h1: "Before Replacing Your ABA EMR, Calculate Lost Hours First",
    metaDescription: "Compare ABA EMR migration against a no-migration recovery layer that sits beside your current software and focuses on cancellations, callouts and documentation readiness.",
    contentAngle: "EMR shoppers may not need to replace their system first; they may need a recovery layer beside it.",
    pageSections: ["EMR replacement risk", "Lost-hour workflow gaps", "No-migration overlay", "Calculator CTA"],
    faqQuestions: ["Is Infinite Suite OS an EMR?", "Can it sit beside CentralReach, Rethink or Motivity?", "What should clinics calculate before switching?"],
    internalLinks: ["/aba-emr-alternative", "/calculator", "/aba-clinic-software", "/centralreach-alternative"]
  },
  {
    slug: "centralreach-alternative",
    path: "/centralreach-alternative",
    cluster: "Competitors and alternatives",
    targetKeywords: ["CentralReach alternative", "CentralReach competitor", "CentralReach replacement", "CentralReach vs Rethink", "CentralReach vs Motivity", "CentralReach vs Catalyst", "RethinkBH alternative", "Motivity alternative", "Catalyst ABA alternative", "Hi Rasmus alternative", "ATrack alternative", "ABA software alternatives"],
    title: "CentralReach Alternative? Calculate Lost Hours Before Migrating",
    h1: "Before Replacing CentralReach, See What Your Clinic Is Losing Around It",
    metaDescription: "Shopping for a CentralReach alternative? Infinite Suite OS helps clinics recover cancellations, callouts and documentation gaps beside the current EMR before migration.",
    contentAngle: "Competitor-replacement searchers are high intent; route them to migration-vs-recovery math.",
    pageSections: ["Calculate before migration", "Cancellations and callouts", "Staff coverage", "Review-ready packets"],
    faqQuestions: ["Is Infinite a CentralReach replacement?", "When should a clinic migrate?", "How does no-migration recovery work?"],
    internalLinks: ["/calculator", "/aba-emr-comparison", "/provider-portal", "/active-learner-pricing"]
  },
  {
    slug: "aba-scheduling-software",
    path: "/aba-scheduling-software",
    cluster: "Operations pain",
    targetKeywords: ["ABA scheduling software", "ABA staff scheduling", "ABA staff scheduling software", "RBT scheduling software", "ABA RBT scheduling software", "ABA scheduling and billing software", "ABA data collection and scheduling software"],
    title: "ABA Scheduling Software for Cancellation Recovery",
    h1: "ABA Scheduling Software Should Recover Hours, Not Just Show the Calendar",
    metaDescription: "ABA scheduling software should help clinics recover missed sessions from cancellations and staff callouts. Add Infinite Suite OS beside your current EMR.",
    contentAngle: "Scheduling recovery page for clinics where cancellations, RBT callouts and makeup-session routing are the pain point.",
    pageSections: ["Why calendars alone do not recover hours", "Cancellation routing", "SubPool coverage", "Recovered-hour scorecard"],
    faqQuestions: ["How does Infinite help with cancellations?", "Can this sit beside CentralReach or Rethink?", "Does it charge per RBT or scheduler?"],
    internalLinks: ["/calculator", "/aba-cancellation-management", "/rbt-callout-coverage", "/provider-portal"]
  },
  {
    slug: "aba-cancellation-management",
    path: "/aba-cancellation-management",
    cluster: "Recovery and lost hours",
    targetKeywords: ["ABA cancellation management software", "ABA makeup session software", "ABA cancellation recovery", "ABA recovered hours", "recover lost ABA hours", "ABA clinic lost revenue cancellations", "ABA clinic cancellation workflow", "ABA clinic makeup session workflow", "ABA scheduling recovery workflow", "ABA session recovery software", "ABA operations recovery software", "ABA revenue leakage cancellations"],
    title: "ABA Cancellation Management Software for Recovered Hours",
    h1: "Turn ABA Cancellations Into Recovered Hours",
    metaDescription: "Manage ABA cancellations with recovery workflows that protect authorized hours, reduce scheduler scramble and create cleaner review-ready records.",
    contentAngle: "High-intent operational pain page for clinics losing money to cancellations and low makeup-session recovery.",
    pageSections: ["Cancellation leakage", "Makeup-session workflow", "Caregiver communication", "Review-ready recovery packets"],
    faqQuestions: ["How many recovered sessions does it take to pay for itself?", "Does the calculator collect PHI?", "Can this support caregiver communication?"],
    internalLinks: ["/calculator", "/aba-scheduling-software", "/aba-lost-hours-calculator", "/provider-portal"]
  },
  {
    slug: "aba-staff-coverage-software",
    path: "/aba-staff-coverage-software",
    cluster: "Staff support",
    targetKeywords: ["ABA staff coverage software", "RBT callout coverage", "ABA RBT callout management", "ABA staff callout workflow", "RBT support software", "RBT burnout solutions ABA", "ABA staff retention software", "ABA field staff support software", "RBT session support app", "ABA staff communication software", "ABA team communication software"],
    title: "ABA Staff Coverage Software for RBT Callouts",
    h1: "RBT Callouts Should Trigger Coverage Workflow, Not Scheduler Scramble",
    metaDescription: "ABA staff coverage software for RBT callouts, SubPool routing, field support and caregiver-aware recovery workflows beside your EMR.",
    contentAngle: "Coverage page for clinics where RBT callouts and part-time staffing create missed hours.",
    pageSections: ["RBT callout routing", "SubPool coverage", "FieldPocket staff support", "Caregiver-aware updates"],
    faqQuestions: ["Can substitutes and floaters use it without extra seats?", "How does staff coverage connect to recovered hours?", "Can it support in-home and center models?"],
    internalLinks: ["/rbt-callout-coverage", "/aba-scheduling-software", "/calculator", "/provider-portal"]
  },
  {
    slug: "aba-caregiver-communication-software",
    path: "/aba-caregiver-communication-software",
    cluster: "Caregiver communication",
    targetKeywords: ["ABA caregiver communication software", "parent communication software for ABA clinics", "ABA parent portal software", "ABA caregiver portal", "ABA family communication software", "ABA secure caregiver updates", "ABA parent training scheduling software", "ABA makeup session communication", "caregiver cancellation ABA software"],
    title: "ABA Caregiver Communication Software for Recovery Workflows",
    h1: "Keep Caregivers Informed While Recovering Missed ABA Sessions",
    metaDescription: "ABA caregiver communication software for secure updates, makeup-session windows and consent-aware recovery workflows beside your existing EMR.",
    contentAngle: "Caregiver communication keywords connect lost-hour recovery to family updates and makeup-session coordination.",
    pageSections: ["Care Pocket updates", "Makeup-session communication", "Consent-aware workflows", "No PHI in public forms"],
    faqQuestions: ["Can caregiver updates support recovery?", "Does the public site collect PHI?", "How does Care Pocket fit beside an EMR?"],
    internalLinks: ["/calculator", "/provider-portal", "/aba-cancellation-management", "/active-learner-pricing"]
  },
  {
    slug: "aba-documentation-software",
    path: "/aba-documentation-software",
    cluster: "Compliance and documentation",
    targetKeywords: ["ABA documentation software", "ABA audit documentation software", "ABA compliance software", "ABA session note review software", "ABA note review workflow", "ABA documentation readiness", "ABA clinical review software", "ABA proof packet", "ABA export packet software", "ABA billing documentation workflow", "ABA payer audit documentation", "ABA authorization documentation"],
    title: "ABA Documentation Software for Review-Ready Recovery Packets",
    h1: "Cleaner ABA Documentation Workflows After a Recovered Session",
    metaDescription: "Support ABA documentation readiness with review workflows, proof packets and export preparation. HIPAA-conscious language, no blanket compliance guarantees.",
    contentAngle: "Compliance and documentation searchers need audit-readiness language and human review, not exaggerated guarantees.",
    pageSections: ["Session note review", "Proof packets", "Export readiness", "Human review"],
    faqQuestions: ["Does Infinite guarantee billing approval?", "How does documentation readiness work?", "Can humans review AI drafts?"],
    internalLinks: ["/calculator", "/provider-portal", "/aba-billing-software", "/aba-authorization-tracking-software"]
  },
  {
    slug: "aba-billing-software",
    path: "/aba-billing-software",
    cluster: "Billing and revenue",
    targetKeywords: ["ABA billing software", "ABA insurance billing software", "ABA revenue cycle management software", "ABA claims billing workflow", "ABA billing and data collection software"],
    title: "ABA Billing Software Support Starts With Recovery-Ready Proof",
    h1: "Make Recovered ABA Sessions Easier to Review Before Export",
    metaDescription: "For ABA billing and revenue cycle teams, Infinite Suite OS focuses on proof-ready recovery workflows before export to the current EMR or billing system.",
    contentAngle: "Billing keywords should route to proof visibility and recovery readiness, not claims approval guarantees.",
    pageSections: ["Recovery before export", "Documentation packets", "Auth utilization", "Billing handoff"],
    faqQuestions: ["Is this billing software?", "Can it support proof packets?", "Does it guarantee claims payment?"],
    internalLinks: ["/aba-documentation-software", "/aba-authorization-tracking-software", "/calculator", "/provider-portal"]
  },
  {
    slug: "aba-authorization-tracking-software",
    path: "/aba-authorization-tracking-software",
    cluster: "Authorization and utilization",
    targetKeywords: ["ABA authorization tracking software", "ABA utilization tracking software", "ABA authorization management software", "ABA authorization documentation"],
    title: "ABA Authorization Tracking Software for Hours at Risk",
    h1: "Protect Authorized ABA Hours Before They Disappear",
    metaDescription: "Track utilization risk and recovery opportunities beside your EMR with Auth War Room workflows for ABA clinics.",
    contentAngle: "Authorization and utilization searches should route to hours-at-risk visibility and recovered-hour workflows.",
    pageSections: ["Auth War Room", "Utilization risk", "Recovered-hour routing", "Scorecard"],
    faqQuestions: ["How does utilization tracking connect to recovery?", "Does this replace the EMR authorization module?", "What does the scorecard show?"],
    internalLinks: ["/calculator", "/aba-cancellation-management", "/aba-billing-software", "/provider-portal"]
  },
  {
    slug: "software-for-new-aba-clinic",
    path: "/software-for-new-aba-clinic",
    cluster: "New clinic startup",
    targetKeywords: ["software for new ABA clinic", "software for opening an ABA clinic", "ABA clinic startup software", "ABA practice startup software", "new ABA clinic software", "ABA clinic operations stack", "ABA clinic startup checklist", "ABA clinic business software", "ABA clinic scheduling software startup", "ABA clinic billing software startup", "ABA clinic EMR startup", "ABA clinic owner software", "BCBA starting ABA clinic", "ABA software for startups", "ABA software for small clinics", "ABA software for new clinic"],
    title: "Software for a New ABA Clinic: Start With Recovery",
    h1: "Opening a New ABA Clinic? Build Recovery Into the Stack From Day One",
    metaDescription: "Software for a new ABA clinic should include EMR, scheduling, billing and operational recovery workflows for cancellations, callouts and documentation readiness.",
    contentAngle: "New clinic keywords are strong buyer intent because founders are building the operations stack now.",
    pageSections: ["Startup stack", "Scheduling and billing", "Recovery workflows", "Founding Clinic Trial"],
    faqQuestions: ["What software does a new ABA clinic need?", "Should startups choose an EMR first?", "How does recovery fit into the stack?"],
    internalLinks: ["/new-aba-clinic-software-stack", "/calculator", "/aba-clinic-software", "/active-learner-pricing"]
  },
  {
    slug: "active-learner-pricing",
    path: "/active-learner-pricing",
    cluster: "Pricing",
    targetKeywords: ["ABA software pricing", "ABA EMR pricing", "active learner pricing", "ABA clinic software cost"],
    title: "ABA Software Pricing Without Staff Seat Fees",
    h1: "Infinite Suite OS Pricing Is Based on Active Learners, Not Staff Seats",
    metaDescription: "Founding Clinic pricing for Infinite Suite OS: $15 per active learner/month, $500/month minimum, unlimited staff and caregiver seats.",
    contentAngle: "Pricing page that differentiates Infinite from staff-seat pricing and full EMR replacement friction.",
    pageSections: ["Design Partner Beta", "Founding Clinic Trial", "Standard Phase 1", "ROI math"],
    faqQuestions: ["Why not charge per staff user?", "What is included in the Founding Clinic Trial?", "How many recovered sessions can offset the cost?"],
    internalLinks: ["/founding-clinic-beta", "/calculator", "/aba-clinic-software", "/provider-portal"]
  }
];

export const seoLandingPages = Object.fromEntries(
  seoPageCatalog.map((page) => [
    page.slug,
    {
      metaTitle: page.title,
      metaDescription: page.metaDescription,
      hero: page.h1,
      subheadline: "Keep your current EMR. Add Infinite Suite OS™ beside it as an operational recovery layer.",
      pain: page.contentAngle,
      audience: "ABA clinic owners, founders, clinical directors, schedulers and operations leaders evaluating recovery workflows.",
      primaryCta: "Calculate lost hours",
      secondaryCta: "Tour Provider Portal",
      formTitle: "Request a Founding Clinic walkthrough"
    } satisfies SEOLandingPage
  ])
) as Record<string, SEOLandingPage>;

export const allLandingPages = {
  ...landingPages,
  ...seoLandingPages
} as const;

export type MarketingLandingPageSlug = keyof typeof allLandingPages;

export function normalizeKeyword(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

export function suggestSEOLandingPage(keyword: string) {
  const normalized = normalizeKeyword(keyword);

  const directMatch = seoPageCatalog.find((page) =>
    page.targetKeywords.some((target) => normalized.includes(normalizeKeyword(target)) || normalizeKeyword(target).includes(normalized))
  );
  if (directMatch) return directMatch;

  if (/centralreach|rethink|motivity|catalyst|rasmus|atrack|alternative|competitor|replacement| vs /.test(normalized)) return seoPageCatalog.find((page) => page.slug === "centralreach-alternative") ?? seoPageCatalog[0];
  if (/startup|new clinic|opening|open an aba|owner|bcba starting/.test(normalized)) return seoPageCatalog.find((page) => page.slug === "software-for-new-aba-clinic") ?? seoPageCatalog[0];
  if (/pricing|cost|price/.test(normalized)) return seoPageCatalog.find((page) => page.slug === "active-learner-pricing") ?? seoPageCatalog[0];
  if (/caregiver|parent|family|communication|portal/.test(normalized)) return seoPageCatalog.find((page) => page.slug === "aba-caregiver-communication-software") ?? seoPageCatalog[0];
  if (/authorization|utilization|auth/.test(normalized)) return seoPageCatalog.find((page) => page.slug === "aba-authorization-tracking-software") ?? seoPageCatalog[0];
  if (/billing|claims|revenue cycle/.test(normalized)) return seoPageCatalog.find((page) => page.slug === "aba-billing-software") ?? seoPageCatalog[0];
  if (/documentation|note|audit|compliance|proof packet|export packet/.test(normalized)) return seoPageCatalog.find((page) => page.slug === "aba-documentation-software") ?? seoPageCatalog[0];
  if (/callout|staff|rbt|coverage|substitute|subpool|burnout|retention/.test(normalized)) return seoPageCatalog.find((page) => page.slug === "aba-staff-coverage-software") ?? seoPageCatalog[0];
  if (/cancellation|cancel|makeup|missed session|recovered hour|lost hour|revenue leakage/.test(normalized)) return seoPageCatalog.find((page) => page.slug === "aba-cancellation-management") ?? seoPageCatalog[0];
  if (/scheduling|scheduler|appointment|calendar/.test(normalized)) return seoPageCatalog.find((page) => page.slug === "aba-scheduling-software") ?? seoPageCatalog[0];
  if (/emr|ehr|comparison/.test(normalized)) return seoPageCatalog.find((page) => page.slug === "aba-emr-comparison") ?? seoPageCatalog[0];
  if (/software|platform|system|practice management|clinic management/.test(normalized)) return seoPageCatalog.find((page) => page.slug === "aba-clinic-software") ?? seoPageCatalog[0];

  return seoPageCatalog[0];
}

export function buildPageBriefText(page: SEOPageBrief, extraKeywords: string[] = []) {
  const keywords = Array.from(new Set([...page.targetKeywords, ...extraKeywords])).slice(0, 12);
  return [
    `URL: ${page.path}`,
    `Title: ${page.title}`,
    `H1: ${page.h1}`,
    `Meta description: ${page.metaDescription}`,
    `Target keywords: ${keywords.join(", ")}`,
    `Content angle: ${page.contentAngle}`,
    "Sections:",
    ...page.pageSections.map((section) => `- ${section}`),
    "FAQs:",
    ...page.faqQuestions.map((question) => `- ${question}`),
    `Internal links: ${page.internalLinks.join(", ")}`,
    "CTA: Calculate lost hours / Tour Provider Portal / Request Founding Clinic walkthrough",
    "Compliance: clinic-level information only; no PHI; human-reviewed outreach."
  ].join("\n");
}
