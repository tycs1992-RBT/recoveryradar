/**
 * Intel pipeline — the connective tissue for the work-login intel suite.
 *
 * Each scanner (Reddit, Places/new-clinic, EMR shopping radar / web, LinkedIn)
 * returns a DIFFERENT shape. This module normalizes any of them into ONE canonical
 * `IntelLead` that maps cleanly onto the Intelligence Bank's POST `records[]` contract
 * (see src/app/api/intelligence-bank/route.ts) and, through it, the Prisma `Lead` model.
 *
 * Flow: scan -> toIntelLead() -> POST /api/intelligence-bank (dedup + persist)
 *       -> appears in CRM -> can be queued for outreach.
 *
 * SAFETY: this only ever carries PUBLIC business information + the public source URL.
 * It deliberately has no field for scraped personal/private profile data. Outreach is a
 * separate, manual, opt-in step — nothing here auto-messages anyone.
 */

export type IntelSource = "reddit" | "places" | "web" | "linkedin";

export type IntelLeadStage = "captured" | "in_crm" | "queued_outreach";

// The canonical record. Matches the Intelligence Bank recordSchema fields so it can be
// POSTed straight into the bank with no extra mapping on the client.
export type IntelLead = {
  recordType: "COMPANY" | "PERSON" | "SOURCE";
  source: IntelSource;
  sourceTool: string;
  name: string;
  companyName?: string;
  role?: string;
  website?: string;
  linkedinUrl?: string;
  sourceUrl?: string;
  publicEmail?: string;
  phone?: string;
  address?: string;
  cityState?: string;
  leadScore?: number;
  leadTemperature?: "hot" | "warm" | "research";
  signal?: string;
  whyItMatters?: string;
  sourceQuery?: string;
  notes?: string;
  riskNote?: string;
  stage: IntelLeadStage;
};

function clampScore(value: unknown) {
  const n = typeof value === "number" ? value : 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

// --- Per-source inputs (loose shapes matching what each route returns) ---

export type RedditPostInput = {
  title?: string;
  permalink?: string;
  subreddit?: string;
  author?: string;
  snippet?: string;
  leadTemperature?: "hot" | "warm" | "research";
  signal?: string;
  whyItMatters?: string;
  riskNote?: string;
  matchedQuery?: string;
};

export type PlacesLeadInput = {
  businessName?: string;
  website?: string;
  phone?: string;
  address?: string;
  cityState?: string;
  googleMapsUrl?: string;
  leadScore?: number;
  newClinicLikelihood?: string;
  sourceQuery?: string;
  notes?: string;
};

export type WebSignalInput = {
  title?: string;
  link?: string;
  inferredCompany?: string;
  leadTemperature?: "hot" | "warm" | "research";
  suggestedSignal?: string;
  whyItMatters?: string;
  leadScore?: number;
  query?: string;
  riskNote?: string;
};

export type LinkedInResultInput = {
  title?: string;
  link?: string;
  inferredCompany?: string;
  inferredName?: string;
  inferredRole?: string;
  snippet?: string;
  query?: string;
};

// --- Normalizers: each returns the SAME canonical IntelLead ---

export function redditToIntelLead(post: RedditPostInput): IntelLead {
  return {
    recordType: "SOURCE",
    source: "reddit",
    sourceTool: "Reddit Signals",
    name: post.title || "Reddit discussion",
    companyName: undefined, // a thread is a signal, not a company — verify before promoting
    sourceUrl: post.permalink,
    cityState: undefined,
    leadTemperature: post.leadTemperature,
    signal: post.signal,
    whyItMatters: post.whyItMatters,
    sourceQuery: post.matchedQuery,
    notes: [post.subreddit ? `Subreddit: ${post.subreddit}` : "", post.snippet ? `Snippet: ${post.snippet}` : ""].filter(Boolean).join("\n"),
    riskNote: post.riskNote || "Public Reddit discovery. Market intelligence only — do not auto-message users or store private details.",
    stage: "captured"
  };
}

export function placesToIntelLead(lead: PlacesLeadInput): IntelLead {
  return {
    recordType: "COMPANY",
    source: "places",
    sourceTool: "New-Clinic Finder (Places)",
    name: lead.businessName || "Unknown clinic",
    companyName: lead.businessName,
    website: lead.website,
    phone: lead.phone,
    address: lead.address,
    cityState: lead.cityState,
    sourceUrl: lead.googleMapsUrl,
    leadScore: clampScore(lead.leadScore),
    signal: lead.newClinicLikelihood ? `new_clinic:${lead.newClinicLikelihood}` : undefined,
    whyItMatters: lead.newClinicLikelihood === "likely-new" ? "Few reviews — likely newly opened; may still be choosing a software stack." : undefined,
    sourceQuery: lead.sourceQuery,
    notes: lead.notes,
    riskNote: "Public Google Places listing. Verify on the clinic's own site/socials before outreach. No emails from Places.",
    stage: "captured"
  };
}

export function webSignalToIntelLead(item: WebSignalInput): IntelLead {
  return {
    recordType: "COMPANY",
    source: "web",
    sourceTool: "EMR Shopping Radar",
    name: item.inferredCompany || item.title || "Web signal",
    companyName: item.inferredCompany,
    sourceUrl: item.link,
    leadScore: clampScore(item.leadScore),
    leadTemperature: item.leadTemperature,
    signal: item.suggestedSignal,
    whyItMatters: item.whyItMatters,
    sourceQuery: item.query,
    riskNote: item.riskNote || "Public web result. Manual review required before outreach.",
    stage: "captured"
  };
}

export function linkedinToIntelLead(item: LinkedInResultInput): IntelLead {
  return {
    recordType: "PERSON",
    source: "linkedin",
    sourceTool: "LinkedIn Prospector (public search)",
    name: item.inferredName || item.title || "LinkedIn public result",
    companyName: item.inferredCompany,
    role: item.inferredRole,
    linkedinUrl: item.link,
    sourceUrl: item.link,
    sourceQuery: item.query,
    notes: item.snippet ? `Snippet: ${item.snippet}` : undefined,
    riskNote: "Public, Google-indexed LinkedIn result only. Do NOT scrape the profile or auto-connect/message. Verify identity + ABA relevance, then add only public business info.",
    stage: "captured"
  };
}

/**
 * Convert a canonical IntelLead into the exact body the Intelligence Bank POST expects.
 * Keeps the bank as the single source of dedup + persistence truth.
 */
export function toBankRecord(lead: IntelLead) {
  return {
    recordType: lead.recordType,
    name: lead.name,
    companyName: lead.companyName,
    role: lead.role,
    website: lead.website,
    linkedinUrl: lead.linkedinUrl,
    sourceUrl: lead.sourceUrl,
    publicEmail: lead.publicEmail,
    phone: lead.phone,
    address: lead.address,
    cityState: lead.cityState,
    leadScore: lead.leadScore,
    sourceQuery: lead.sourceQuery,
    sourceTool: lead.sourceTool,
    notes: [lead.notes, lead.whyItMatters ? `Why it matters: ${lead.whyItMatters}` : "", lead.riskNote ? `Risk note: ${lead.riskNote}` : ""].filter(Boolean).join("\n")
  };
}

export function toBankRecords(leads: IntelLead[]) {
  return { records: leads.map(toBankRecord) };
}
