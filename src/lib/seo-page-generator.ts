import type {
  SeoLandingPage,
  SeoPageSection,
  SeoPageFaq,
  SeoSocialPosts,
  SeoInternalLink,
  SeoCategory
} from "./seo-page-types";

/**
 * Deterministic SEO landing-page generator.
 *
 * No external calls — given a keyword + a few options it returns a complete, structured,
 * compliance-safe page. (An AI path can layer on top later via OPENAI_API_KEY; the shape it
 * must return is exactly this object, so the renderer/store never change.)
 *
 * GUARDRAILS are not optional decoration — they're constructed into every page:
 *   - no PHI; no blanket HIPAA / payer-approval / billing-compliance guarantees
 *   - no "AI therapist" / "AI BCBA" claims; human review required before publish
 *   - "supports compliance workflows", never "guarantees compliance"
 *   - positioning is always "keep your current EMR, add Infinite Suite OS beside it"
 *   - no fabricated statistics, no direct competitor attacks
 */

export const SEO_PROMPT_VERSION = "factory-v1";

const PROMPT = "factory-v1";

export type GenerateInput = {
  keyword: string;
  slug?: string;
  audience?: string;
  searchIntent?: string;
  competitorAngle?: string;
  recoveryFocus?: string;
  ctaFocus?: string;
  location?: string;
  tone?: string;
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Map a keyword to one of the public category buckets.
export function categoryForKeyword(keyword: string): SeoCategory {
  const k = keyword.toLowerCase();
  if (/alternative|replacement|centralreach|rethink|motivity|catalyst|calmanac|\bvs\b|competitor/.test(k)) return "EMR Alternatives";
  if (/callout|coverage|staff|rbt|substitute|subpool|burnout|retention/.test(k)) return "Staff Coverage";
  if (/caregiver|parent|family|communication|portal/.test(k)) return "Caregiver Communication";
  if (/compliance|documentation|note|audit|proof|packet/.test(k)) return "Compliance & Documentation";
  if (/new clinic|startup|opening|owner|founding|launch/.test(k)) return "New Clinic / Startup";
  if (/pricing|cost|price|pilot|founding/.test(k)) return "Pricing / Founding Pilot";
  return "Scheduling & Recovery";
}

const COMPLIANCE_NOTE =
  "Operational estimates only. Infinite Suite OS™ supports compliance and documentation workflows but does not guarantee HIPAA compliance, payer approval, or billing correctness, and is not a medical, clinical, or billing decision-maker. No PHI is shown in these tools. All outputs require human review before action. Infinite Suite OS™ is an operational recovery layer that works beside your current EMR — it is not a full EMR replacement.";

function recoveryWorkflowSection(focus?: string): SeoPageSection {
  const lead = focus
    ? `With a focus on ${focus.toLowerCase()}, the recovery workflow runs the moment a session is at risk:`
    : "The recovery workflow runs the moment a session is at risk:";
  return {
    heading: "The recovery workflow",
    body:
      `${lead}\n\n` +
      "Cancellation or RBT callout → Scheduler AI™ → Auth Utilization / War Room → SubPool™ → FieldPocket™ → Care Pocket™ → Compliance Sentinel™ → API Integration Hub™.\n\n" +
      "One canceled session becomes one recovered, supported, documented, review-ready hour — beside your current EMR, not instead of it."
  };
}

const CALCULATOR_COPY =
  "Before you switch EMRs, calculate your lost-hours baseline.\n\n" +
  "Shopping for ABA software? Before you migrate your clinic into another platform, estimate how many hours are being lost through cancellations, RBT callouts, poor recovery routing, caregiver communication gaps, and documentation cleanup.\n\n" +
  "Your EMR may track the session. Infinite Suite OS™ is built to help recover the session before it disappears.";

function buildSections(keyword: string, audience: string, recoveryFocus?: string, competitorAngle?: string): SeoPageSection[] {
  const sections: SeoPageSection[] = [];

  sections.push({
    heading: "The operational problem",
    body:
      `Teams searching for ${keyword} are usually feeling the same operational pain: cancellations and staff callouts quietly turn authorized, billable hours into lost ones. ` +
      `For ${audience.toLowerCase()}, the gap is rarely the EMR's data collection — it's the scramble after a session falls through, when there's no fast, fair way to route a makeup, cover a callout, keep the caregiver informed, and keep the documentation clean.`
  });

  sections.push({
    heading: "Why an EMR replacement may not solve this first",
    body:
      "Migrating to another full platform is expensive, slow, and disruptive — and it often doesn't fix the highest-friction gap, which is recovery after a cancellation. " +
      (competitorAngle ? `Compared with ${competitorAngle}, the faster win is operational: ` : "The faster win is operational: ") +
      "keep the EMR your clinic already runs on, and add Infinite Suite OS™ beside it as a recovery layer that measures and recovers the hours at risk before you take on a migration."
  });

  sections.push(recoveryWorkflowSection(recoveryFocus));

  sections.push({
    heading: "Calculate your lost-hours baseline",
    body: CALCULATOR_COPY
  });

  return sections;
}

function buildFaq(keyword: string): SeoPageFaq[] {
  return [
    {
      question: `Is Infinite Suite OS™ a replacement for our ${/emr|ehr/i.test(keyword) ? "EMR" : "current software"}?`,
      answer:
        "No. Infinite Suite OS™ is an operational recovery layer that works beside your current EMR. You keep your existing system of record and add recovery, coverage, caregiver communication, and documentation-support workflows on top."
    },
    {
      question: "Does it guarantee HIPAA compliance or billing correctness?",
      answer:
        "No tool can guarantee that. Infinite Suite OS™ supports compliance and documentation workflows and helps teams prepare cleaner, review-ready records, but every output requires human review, and billing and payer decisions stay with your qualified staff."
    },
    {
      question: "How does it help with cancellations and RBT callouts?",
      answer:
        "When a session is canceled or a technician calls out, the recovery workflow routes the opening — a makeup, a substitute via SubPool™, or supported admin time — so the authorized hour has a fair chance to be recovered instead of silently lost."
    },
    {
      question: "Do we have to migrate our data to get started?",
      answer:
        "No. The recovery layer is designed to sit beside your current platform, so you can measure the hours at risk and run recovery workflows without a full data migration."
    },
    {
      question: "Is any patient information exposed in these tools?",
      answer:
        "No PHI is shown in the operational tools, and the workflows are built around de-identified operational data with human review before any action."
    }
  ];
}

function buildSocialPosts(keyword: string, slug: string): SeoSocialPosts {
  const pageHint = `/topics/${slug}`;
  return {
    linkedinFounder:
      `I spent 10 years as an RBT before I built software — long enough to watch cancellations and callouts quietly become lost, unbillable hours.\n\n` +
      `If you're evaluating ${keyword}, here's the question I'd ask before migrating anything: how many authorized hours are you losing every month to cancellations and coverage gaps?\n\n` +
      `Keep your EMR. Add a recovery layer beside it. Measure the hours at risk first.\n\nCalculate your lost-hours baseline → (link to ${pageHint} and the calculator)`,
    linkedinShort:
      `Before you switch ABA EMRs, calculate your lost-hours baseline. Cancellations and RBT callouts turn billable hours into lost ones — recover the workflow first. (${pageHint})`,
    facebook:
      `ABA clinic owners: before you migrate to another platform, find out how many hours you're losing to cancellations, callouts, and documentation cleanup. Keep your EMR — add recovery beside it. Try the Lost Hours Calculator. (${pageHint})`,
    emailTeaser:
      `Subject: How many ABA hours are you losing each month?\n\n` +
      `Most clinics shopping for new software are really trying to fix one thing: hours lost to cancellations and callouts. Before you take on a migration, estimate your lost-hours baseline — and see how a recovery layer beside your current EMR can recover the session before it disappears.`,
    googleAdsHeadline: "Recover Lost ABA Hours",
    googleAdsDescription:
      "Keep your EMR. Add Infinite Suite OS™ beside it to recover cancellations & callouts. Calculate your lost-hours baseline."
  };
}

function buildInternalLinks(): SeoInternalLink[] {
  return [
    { label: "Calculate lost hours", href: "/calculator" },
    { label: "Take the operations quiz", href: "/quiz" },
    { label: "Tour the Provider Portal", href: "/provider-portal" },
    { label: "Browse the ABA keyword bank", href: "/aba-keyword-bank" },
    { label: "All ABA topics", href: "/topics" }
  ];
}

function buildSchema(page: { h1: string; metaDescription: string; faq: SeoPageFaq[]; slug: string }): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: page.h1,
        description: page.metaDescription,
        url: `/topics/${page.slug}`
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer }
        }))
      }
    ]
  };
}

/**
 * Build a complete draft SeoLandingPage from a keyword + options. Pure + deterministic.
 */
export function generateSeoPage(input: GenerateInput): SeoLandingPage {
  const keyword = input.keyword.trim();
  const slug = slugify(input.slug?.trim() || keyword);
  const audience = input.audience?.trim() || "ABA clinic owners and operations leaders";
  const searchIntent = input.searchIntent?.trim() || "commercial / buyer-intent";
  const cluster = categoryForKeyword(keyword);
  const locationSuffix = input.location?.trim() ? ` in ${input.location.trim()}` : "";

  const h1 = `${capitalize(keyword)}${locationSuffix}: recover the hours before you migrate`;
  const seoTitle = trimToLength(`${capitalize(keyword)} | Recover Lost Hours | Infinite Suite OS™`, 60);
  const metaDescription = trimToLength(
    `Evaluating ${keyword}? Keep your current EMR and add Infinite Suite OS™ beside it to recover cancellations and RBT callouts. Calculate your lost-hours baseline first.`,
    158
  );

  const faq = buildFaq(keyword);
  const sections = buildSections(keyword, audience, input.recoveryFocus, input.competitorAngle);
  const socialPosts = buildSocialPosts(keyword, slug);
  const now = new Date().toISOString();

  return {
    id: `seo_${slug}_${Date.now().toString(36)}`,
    slug,
    status: "DRAFT",
    keyword,
    keywordCluster: cluster,
    searchIntent,
    audience,
    competitorAngle: input.competitorAngle?.trim() || undefined,
    recoveryFocus: input.recoveryFocus?.trim() || undefined,
    ctaFocus: input.ctaFocus?.trim() || "Lost Hours Calculator",
    location: input.location?.trim() || undefined,
    tone: input.tone?.trim() || "direct, operator-to-operator",
    title: `${capitalize(keyword)} — Infinite Suite OS™`,
    seoTitle,
    metaDescription,
    h1,
    intro:
      `If you're researching ${keyword}, you're probably trying to stop authorized hours from leaking out of the clinic. ` +
      "Before committing to a migration, the highest-leverage move is to measure the hours at risk and recover the workflow — beside the EMR you already run.",
    sections,
    faq,
    schemaJson: buildSchema({ h1, metaDescription, faq, slug }),
    internalLinks: buildInternalLinks(),
    ctaPrimary: "Calculate lost hours",
    ctaSecondary: "Tour Provider Portal",
    socialPosts,
    emailTeaser: socialPosts.emailTeaser,
    complianceNotes: COMPLIANCE_NOTE,
    generatedBy: "template",
    promptVersion: PROMPT,
    createdAt: now,
    updatedAt: now
  };
}

function trimToLength(value: string, max: number): string {
  if (value.length <= max) return value;
  // Cut at the last word boundary before the limit so titles/descriptions never end mid-word.
  const slice = value.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice;
  return cut.replace(/[\s\u2013\u2014|,;:.]+$/, "");
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export { CALCULATOR_COPY, COMPLIANCE_NOTE };
