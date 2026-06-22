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
    targetKeywords: ["ABA clinic software", "ABA therapy software", "ABA practice management software", "ABA clinic software platform"],
    title: "ABA Clinic Software for Lost-Hour Recovery",
    h1: "ABA Clinic Software That Helps Recover Missed Sessions",
    metaDescription: "Explore ABA clinic software built as an operational recovery layer beside your EMR. Recover missed hours from cancellations, callouts and workflow gaps.",
    contentAngle: "Commercial software page for buyers comparing ABA clinic software but not ready for a full EMR migration.",
    pageSections: ["Keep your current EMR", "Recover missed authorized hours", "Unlimited staff and caregiver seats", "Founding Clinic Trial pricing"],
    faqQuestions: ["Is Infinite Suite OS an EMR replacement?", "How does active-learner pricing work?", "Can staff and caregivers access it without seat fees?"],
    internalLinks: ["/calculator", "/provider-portal", "/founding-clinic-beta", "/aba-emr-alternative"]
  },
  {
    slug: "aba-scheduling-software",
    path: "/aba-scheduling-software",
    cluster: "Operations pain",
    targetKeywords: ["ABA scheduling software", "ABA staff scheduling", "ABA scheduler software", "ABA appointment scheduling"],
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
    cluster: "Pain/problem",
    targetKeywords: ["ABA cancellation management", "ABA cancellation software", "ABA missed session recovery", "ABA recovered hours"],
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
    cluster: "Staff coverage",
    targetKeywords: ["ABA staff coverage software", "RBT callout coverage ABA", "ABA substitute RBT coverage", "ABA staffing software"],
    title: "ABA Staff Coverage Software for RBT Callouts",
    h1: "RBT Callouts Should Trigger Coverage Workflow, Not Scheduler Scramble",
    metaDescription: "ABA staff coverage software for RBT callouts, SubPool routing, field support and caregiver-aware recovery workflows beside your EMR.",
    contentAngle: "Coverage page for clinics where RBT callouts and part-time staffing create missed hours.",
    pageSections: ["RBT callout routing", "SubPool coverage", "FieldPocket staff support", "Caregiver-aware updates"],
    faqQuestions: ["Can substitutes and floaters use it without extra seats?", "How does staff coverage connect to recovered hours?", "Can it support in-home and center models?"],
    internalLinks: ["/rbt-callout-coverage", "/aba-scheduling-software", "/calculator", "/provider-portal"]
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

  if (/pricing|cost|price/.test(normalized)) return seoPageCatalog.find((page) => page.slug === "active-learner-pricing") ?? seoPageCatalog[0];
  if (/callout|staff|rbt|coverage|substitute|subpool/.test(normalized)) return seoPageCatalog.find((page) => page.slug === "aba-staff-coverage-software") ?? seoPageCatalog[0];
  if (/cancellation|cancel|missed session|recovered hour|lost hour/.test(normalized)) return seoPageCatalog.find((page) => page.slug === "aba-cancellation-management") ?? seoPageCatalog[0];
  if (/scheduling|scheduler|appointment|calendar/.test(normalized)) return seoPageCatalog.find((page) => page.slug === "aba-scheduling-software") ?? seoPageCatalog[0];
  if (/software|platform|system|practice management|emr|billing/.test(normalized)) return seoPageCatalog.find((page) => page.slug === "aba-clinic-software") ?? seoPageCatalog[0];

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
