/**
 * SEO Landing Page Factory — data model.
 *
 * This is the canonical shape for a generated/published SEO landing page. It mirrors the
 * Prisma `SeoLandingPage` model in the prompt closely enough that moving from the current
 * file-backed store to Prisma later is a drop-in (same field names, same JSON sub-shapes).
 *
 * Storage today: a git-committed JSON file (see seo-page-store.ts). That fits the
 * localhost -> commit -> Vercel-deploy workflow: you generate/approve/publish pages locally,
 * the JSON is part of the repo, and PUBLISHED pages go live on the next deploy.
 */

export type SeoPageStatus = "DRAFT" | "NEEDS_REVIEW" | "APPROVED" | "PUBLISHED" | "ARCHIVED";

export type SeoPageSection = {
  heading: string;
  body: string;
};

export type SeoPageFaq = {
  question: string;
  answer: string;
};

export type SeoSocialPosts = {
  linkedinFounder: string;
  linkedinShort: string;
  facebook: string;
  emailTeaser: string;
  googleAdsHeadline: string;
  googleAdsDescription: string;
};

export type SeoInternalLink = {
  label: string;
  href: string;
};

export type SeoLandingPage = {
  id: string;
  slug: string;
  status: SeoPageStatus;
  keyword: string;
  keywordCluster: string;
  searchIntent: string;
  audience: string;
  competitorAngle?: string;
  recoveryFocus?: string;
  ctaFocus?: string;
  location?: string;
  tone?: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  sections: SeoPageSection[];
  faq: SeoPageFaq[];
  schemaJson: Record<string, unknown>;
  internalLinks: SeoInternalLink[];
  ctaPrimary: string;
  ctaSecondary: string;
  socialPosts: SeoSocialPosts;
  emailTeaser: string;
  complianceNotes: string;
  generatedBy: "ai" | "template";
  model?: string;
  promptVersion: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  publishedAt?: string;
};

// The public-facing category buckets used to group pages on the /topics index.
export const SEO_CATEGORIES = [
  "EMR Alternatives",
  "Scheduling & Recovery",
  "Staff Coverage",
  "Caregiver Communication",
  "Compliance & Documentation",
  "New Clinic / Startup",
  "Pricing / Founding Pilot"
] as const;

export type SeoCategory = (typeof SEO_CATEGORIES)[number];

// Keyword seeds shown in the factory's keyword source panel.
export const SEO_KEYWORD_SEEDS: string[] = [
  "ABA practice management software",
  "ABA EMR software",
  "ABA clinic software",
  "ABA scheduling software",
  "CentralReach alternative",
  "RethinkBH alternative",
  "Motivity alternative",
  "Catalyst ABA alternative",
  "ABA cancellation management software",
  "ABA makeup session software",
  "RBT callout coverage",
  "recover lost ABA hours",
  "ABA software migration",
  "ABA EMR migration",
  "ABA clinical and operational workflow",
  "ABA practice management platform",
  "ABA all in one platform",
  "ABA operational complexity software",
  "Calmanac alternative",
  "Motivity Calmanac"
];
