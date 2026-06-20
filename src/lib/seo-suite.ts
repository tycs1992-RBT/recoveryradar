export type KeywordIntent = "buyer" | "comparison" | "pain" | "startup" | "local" | "informational" | "brand";

export type KeywordPlannerRow = {
  keyword: string;
  avgMonthlySearches?: number | null;
  competition?: string | null;
  competitionIndex?: number | null;
  lowTopOfPageBid?: number | null;
  highTopOfPageBid?: number | null;
  source?: string | null;
};

export type KeywordOpportunity = KeywordPlannerRow & {
  normalized: string;
  intent: KeywordIntent;
  cluster: string;
  priorityScore: number;
  recommendedPage: string;
  pageTitle: string;
  h1: string;
  metaDescription: string;
  faq: string[];
  outline: string[];
  cta: string;
  internalLinks: string[];
  adGroup: string;
  adHeadlines: string[];
  notes: string;
};

export type PageMapEntry = {
  slug: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  intent: KeywordIntent;
  title: string;
  h1: string;
  metaDescription: string;
  contentAngle: string;
  cta: string;
  priorityScore: number;
};

export type ContentCalendarEntry = {
  day: number;
  type: "Landing page" | "Blog" | "LinkedIn post" | "Email nurture" | "Google Ad group";
  title: string;
  keyword: string;
  owner: string;
  status: "Planned" | "Draft" | "Review" | "Ready";
  cta: string;
};

export type LocalSeoEntry = {
  location: string;
  keyword: string;
  slug: string;
  title: string;
  h1: string;
  angle: string;
};

export type CompetitorRadarEntry = {
  competitor: string;
  keyword: string;
  pageIdea: string;
  angle: string;
  risk: string;
  cta: string;
};

export type LeadKeywordBridgeEntry = {
  leadQuery: string;
  matchingKeywords: string[];
  outreachAngle: string;
  landingPage: string;
};

const buyerSignals = ["software", "platform", "system", "tool", "emr", "ehr", "practice management", "billing", "scheduler", "scheduling", "crm"];
const comparisonSignals = ["alternative", "competitor", "vs", "compare", "replacement", "centralreach", "rethink", "motivity", "catalyst", "atrack"];
const painSignals = ["cancellation", "cancel", "callout", "staff", "coverage", "authorization", "documentation", "lost hours", "revenue leakage", "makeup session", "caregiver communication"];
const startupSignals = ["open", "opening", "startup", "start", "new clinic", "how to open", "practice startup"];
const localSignals = ["near me", "florida", "new hampshire", "massachusetts", "texas", "california", "georgia", "new york", "clinic near"];
const brandSignals = ["centralreach", "rethink", "motivity", "catalyst", "hi rasmus", "atrack"];

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[™®]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function includesAny(text: string, signals: string[]) {
  return signals.some((signal) => text.includes(signal));
}

export function inferIntent(keyword: string): KeywordIntent {
  const lower = keyword.toLowerCase();
  if (includesAny(lower, comparisonSignals)) return "comparison";
  if (includesAny(lower, brandSignals)) return "brand";
  if (includesAny(lower, startupSignals)) return "startup";
  if (includesAny(lower, painSignals)) return "pain";
  if (includesAny(lower, localSignals)) return "local";
  if (includesAny(lower, buyerSignals)) return "buyer";
  return "informational";
}

export function clusterForIntent(intent: KeywordIntent, keyword: string) {
  const lower = keyword.toLowerCase();
  if (intent === "comparison") return "Competitors and alternatives";
  if (intent === "brand") return "Vendor comparison";
  if (intent === "startup") return "New clinic startup";
  if (intent === "pain") return "Operational pain";
  if (intent === "local") return "Local search";
  if (/billing/.test(lower)) return "Billing and revenue";
  if (/schedule|scheduler/.test(lower)) return "Scheduling";
  if (/emr|ehr|practice management|clinic software/.test(lower)) return "ABA software shoppers";
  return "Education and nurture";
}

function defaultVolumeScore(row: KeywordPlannerRow, intent: KeywordIntent) {
  if (typeof row.avgMonthlySearches === "number") return Math.min(35, Math.round(Math.log10(row.avgMonthlySearches + 10) * 12));
  if (intent === "buyer") return 26;
  if (intent === "comparison") return 23;
  if (intent === "pain") return 20;
  if (intent === "startup") return 18;
  if (intent === "local") return 16;
  return 10;
}

function competitionPenalty(row: KeywordPlannerRow) {
  const label = (row.competition ?? "").toLowerCase();
  const index = typeof row.competitionIndex === "number" ? row.competitionIndex : null;
  if (index != null) return Math.round(index / 10);
  if (label.includes("high")) return 12;
  if (label.includes("medium")) return 7;
  if (label.includes("low")) return 3;
  return 5;
}

function cpcScore(row: KeywordPlannerRow) {
  const high = row.highTopOfPageBid ?? 0;
  if (!high) return 6;
  return Math.min(18, Math.round(high * 3));
}

function intentScore(intent: KeywordIntent) {
  const scores: Record<KeywordIntent, number> = {
    buyer: 28,
    comparison: 30,
    pain: 27,
    startup: 22,
    local: 18,
    brand: 25,
    informational: 10
  };
  return scores[intent];
}

export function scoreKeyword(row: KeywordPlannerRow) {
  const intent = inferIntent(row.keyword);
  const score = intentScore(intent) + defaultVolumeScore(row, intent) + cpcScore(row) - competitionPenalty(row);
  return Math.max(1, Math.min(100, Math.round(score)));
}

function recommendedSlug(keyword: string, intent: KeywordIntent) {
  const lower = keyword.toLowerCase();
  if (intent === "comparison" || lower.includes("alternative")) return `/${slugify(keyword.replace(/\bsoftware\b/g, "").trim())}`;
  if (lower.includes("centralreach")) return "/centralreach-alternative";
  if (lower.includes("cancellation")) return "/aba-cancellation-recovery";
  if (lower.includes("callout")) return "/rbt-callout-coverage";
  if (lower.includes("authorization")) return "/aba-authorization-tracking";
  if (lower.includes("caregiver")) return "/aba-caregiver-communication";
  if (lower.includes("open") || lower.includes("startup")) return "/new-aba-clinic-software-stack";
  if (lower.includes("emr") || lower.includes("practice management")) return "/aba-emr-alternative";
  return `/${slugify(keyword)}`;
}

function titleFor(keyword: string, intent: KeywordIntent) {
  if (intent === "comparison") return `${titleCase(keyword)}? Calculate Lost ABA Hours Before Switching`;
  if (intent === "pain") return `${titleCase(keyword)} Workflow for ABA Clinics`;
  if (intent === "startup") return `${titleCase(keyword)}: Recovery-First Software Stack`;
  if (intent === "local") return `${titleCase(keyword)} | Operational Recovery for ABA Clinics`;
  return `${titleCase(keyword)} | Keep Your EMR and Add Recovery`;
}

function h1For(keyword: string, intent: KeywordIntent) {
  if (intent === "comparison") return `Before You Switch, Check Your Recovery Gaps`;
  if (intent === "pain") return `Turn ${titleCase(keyword)} Into Recoverable Hours`;
  if (intent === "startup") return `Build Your ABA Clinic Stack Around Recovery`;
  if (intent === "local") return `ABA Recovery Workflows for ${titleCase(keyword.replace(/aba|software|clinic/gi, "").trim() || keyword)}`;
  return `Keep Your EMR. Add Operational Recovery.`;
}

function metaFor(keyword: string) {
  return `Shopping for ${keyword}? Infinite Suite OS sits beside your current EMR to recover cancellations, callouts, caregiver communication gaps, and review-ready workflows.`.slice(0, 158);
}

function faqFor(intent: KeywordIntent) {
  const shared = [
    "Does Infinite Suite OS replace my EMR?",
    "How does operational recovery protect authorized hours?",
    "Does AI make clinical decisions?"
  ];
  if (intent === "comparison") return ["Should I replace my EMR or add a recovery layer?", "What should I calculate before migrating?", ...shared];
  if (intent === "pain") return ["How do ABA clinics recover cancelled sessions?", "How are RBT callouts routed?", ...shared];
  if (intent === "startup") return ["What software does a new ABA clinic need first?", "How should startups track cancellations and callouts?", ...shared];
  return ["What is an ABA operational recovery layer?", "How does it work beside current systems?", ...shared];
}

function outlineFor(keyword: string, intent: KeywordIntent) {
  return [
    `Why ${keyword} searches usually point to operational gaps`,
    "The lost-hours problem: cancellations, callouts, auth utilization, and documentation cleanup",
    "The no-migration recovery workflow beside the current EMR",
    "Module map: Scheduler AI, SubPool, Care Pocket, Compliance Sentinel, Auth War Room, API Hub",
    "Calculator CTA: estimate monthly hours at risk",
    "Provider Portal CTA: review homepage, then enter the mock OS"
  ];
}

function ctaFor(intent: KeywordIntent) {
  if (intent === "comparison") return "Before you switch EMRs, calculate your lost hours.";
  if (intent === "startup") return "Build your startup operations stack around recovery from day one.";
  if (intent === "pain") return "See how one cancelled ABA session becomes one recovered, supported, review-ready hour.";
  return "Go to demo.infinitepieces.ai, review the homepage, then click Provider Portal.";
}

function adHeadlinesFor(keyword: string) {
  const base = titleCase(keyword).slice(0, 28);
  return [
    "Keep Your ABA EMR",
    "Recover Lost ABA Hours",
    "Before You Switch EMRs",
    base,
    "Add Recovery Beside EMR",
    "Founding Clinics Wanted"
  ];
}

function titleCase(input: string) {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function buildKeywordOpportunity(row: KeywordPlannerRow): KeywordOpportunity {
  const normalized = row.keyword.trim().toLowerCase();
  const intent = inferIntent(row.keyword);
  const cluster = clusterForIntent(intent, row.keyword);
  const recommendedPage = recommendedSlug(row.keyword, intent);
  return {
    ...row,
    normalized,
    intent,
    cluster,
    priorityScore: scoreKeyword(row),
    recommendedPage,
    pageTitle: titleFor(row.keyword, intent),
    h1: h1For(row.keyword, intent),
    metaDescription: metaFor(row.keyword),
    faq: faqFor(intent),
    outline: outlineFor(row.keyword, intent),
    cta: ctaFor(intent),
    internalLinks: ["/aba-lost-hours-calculator", "/provider-portal", "/founding-clinic-beta"],
    adGroup: cluster,
    adHeadlines: adHeadlinesFor(row.keyword),
    notes: "Use this keyword as a page, ad group, outreach angle, or internal-link anchor depending on priority score."
  };
}

export function generateSeedRows(niche: string, locations: string[] = []): KeywordPlannerRow[] {
  const base = niche.trim() || "ABA clinic software";
  const seeds = [
    base,
    `${base} software`,
    `${base} system`,
    `${base} platform`,
    `best ${base}`,
    `${base} pricing`,
    `${base} reviews`,
    "ABA EMR software",
    "ABA practice management software",
    "ABA clinic software",
    "CentralReach alternative",
    "Rethink alternative",
    "Motivity alternative",
    "Catalyst alternative",
    "ABA scheduling software",
    "ABA cancellation management",
    "RBT callout coverage ABA",
    "ABA authorization tracking",
    "ABA caregiver communication software",
    "ABA documentation readiness",
    "ABA lost hours calculator",
    "ABA recovered hours",
    "how to open an ABA clinic",
    "ABA clinic startup software",
    "ABA operational recovery software",
    ...locations.flatMap((location) => [
      `${base} ${location}`,
      `${base} near ${location}`,
      `ABA clinic software ${location}`,
      `ABA scheduling software ${location}`,
      `ABA cancellation management ${location}`
    ])
  ];
  return Array.from(new Set(seeds)).map((keyword) => ({ keyword, source: "seed" }));
}

export function buildKeywordAnalysis(rows: KeywordPlannerRow[]) {
  const opportunities = rows
    .filter((row) => row.keyword?.trim())
    .map(buildKeywordOpportunity)
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const pageMap = buildPageMap(opportunities);
  const calendar = buildContentCalendar(opportunities);
  const localSeo = buildLocalSeo(opportunities, ["Florida", "New Hampshire", "Massachusetts", "Texas", "California"]);
  const competitors = buildCompetitorRadar(opportunities);
  const leadBridge = buildLeadKeywordBridge(opportunities);

  return { opportunities, pageMap, calendar, localSeo, competitors, leadBridge };
}

export function buildPageMap(opportunities: KeywordOpportunity[]): PageMapEntry[] {
  const bySlug = new Map<string, KeywordOpportunity[]>();
  for (const item of opportunities) {
    const arr = bySlug.get(item.recommendedPage) ?? [];
    arr.push(item);
    bySlug.set(item.recommendedPage, arr);
  }
  return Array.from(bySlug.entries())
    .map(([slug, items]) => {
      const sorted = items.sort((a, b) => b.priorityScore - a.priorityScore);
      const primary = sorted[0];
      return {
        slug,
        primaryKeyword: primary.keyword,
        secondaryKeywords: sorted.slice(1, 8).map((item) => item.keyword),
        intent: primary.intent,
        title: primary.pageTitle,
        h1: primary.h1,
        metaDescription: primary.metaDescription,
        contentAngle: primary.notes,
        cta: primary.cta,
        priorityScore: Math.round(sorted.reduce((sum, item) => sum + item.priorityScore, 0) / sorted.length)
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

export function buildContentCalendar(opportunities: KeywordOpportunity[]): ContentCalendarEntry[] {
  const items = opportunities.slice(0, 30);
  return items.map((item, index) => {
    const type: ContentCalendarEntry["type"] =
      index % 5 === 0 ? "Landing page" : index % 5 === 1 ? "Blog" : index % 5 === 2 ? "LinkedIn post" : index % 5 === 3 ? "Email nurture" : "Google Ad group";
    return {
      day: index + 1,
      type,
      title: type === "Landing page" ? item.pageTitle : `${type}: ${item.keyword}`,
      keyword: item.keyword,
      owner: index % 2 === 0 ? "Tyler" : "Mark",
      status: "Planned",
      cta: item.cta
    };
  });
}

export function buildLocalSeo(opportunities: KeywordOpportunity[], locations: string[]): LocalSeoEntry[] {
  const baseKeywords = opportunities.filter((item) => ["buyer", "pain", "startup"].includes(item.intent)).slice(0, 8);
  return locations.flatMap((location) =>
    baseKeywords.map((item) => {
      const keyword = `${item.keyword} ${location}`;
      return {
        location,
        keyword,
        slug: `/${slugify(keyword)}`,
        title: `${titleCase(item.keyword)} in ${location} | Recovery Layer for ABA Clinics`,
        h1: `${titleCase(item.keyword)} for ABA Clinics in ${location}`,
        angle: `Local page that explains the lost-hours recovery workflow for ${location} clinics and routes visitors to the calculator and Provider Portal.`
      };
    })
  );
}

export function buildCompetitorRadar(opportunities: KeywordOpportunity[]): CompetitorRadarEntry[] {
  const competitors = ["CentralReach", "Rethink", "Motivity", "Catalyst", "ATrack", "Hi Rasmus"];
  return competitors.flatMap((competitor) => {
    const keyword = `${competitor} alternative`;
    return {
      competitor,
      keyword,
      pageIdea: `/${slugify(keyword)}`,
      angle: `Capture ${competitor} comparison shoppers by reframing from migration to operational recovery.` ,
      risk: "Avoid claiming feature-by-feature replacement. Position as no-migration recovery layer beside current EMR.",
      cta: "Calculate lost hours before switching."
    };
  }).concat(opportunities.filter((item) => item.intent === "comparison").slice(0, 8).map((item) => ({
    competitor: item.keyword,
    keyword: item.keyword,
    pageIdea: item.recommendedPage,
    angle: item.notes,
    risk: "Do not use deceptive competitor claims. Keep comparison factual and workflow-focused.",
    cta: item.cta
  })));
}

export function buildLeadKeywordBridge(opportunities: KeywordOpportunity[]): LeadKeywordBridgeEntry[] {
  const leadQueries = [
    "ABA clinic Florida",
    "ABA therapy center New Hampshire",
    "ABA clinic hiring BCBA",
    "new ABA clinic opening",
    "CentralReach alternative ABA",
    "ABA clinic scheduler hiring"
  ];
  return leadQueries.map((leadQuery) => {
    const words = leadQuery.toLowerCase().split(/\s+/);
    const matching = opportunities
      .filter((item) => words.some((word) => item.keyword.toLowerCase().includes(word)))
      .slice(0, 5)
      .map((item) => item.keyword);
    return {
      leadQuery,
      matchingKeywords: matching.length ? matching : opportunities.slice(0, 3).map((item) => item.keyword),
      outreachAngle: `Use public intent around “${leadQuery}” to ask about cancellations, callouts, and whether they know their lost-hours number before replacing software.`,
      landingPage: matching.length ? buildKeywordOpportunity({ keyword: matching[0] }).recommendedPage : "/aba-lost-hours-calculator"
    };
  });
}

export function parseNumber(input: string | undefined) {
  if (!input) return null;
  const cleaned = input.replace(/[$,%<>]/g, "").replace(/,/g, "").trim();
  if (!cleaned || cleaned === "--") return null;
  const match = cleaned.match(/[0-9.]+/);
  return match ? Number(match[0]) : null;
}

export function parseKeywordPlannerCsv(csv: string): KeywordPlannerRow[] {
  const rows = parseCsv(csv);
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const findIndex = (candidates: string[]) => headers.findIndex((h) => candidates.some((candidate) => h.includes(candidate)));
  const keywordIndex = findIndex(["keyword"]);
  const volumeIndex = findIndex(["avg. monthly searches", "average monthly searches", "monthly searches", "search volume"]);
  const competitionIndex = findIndex(["competition"]);
  const competitionScoreIndex = findIndex(["competition (indexed value)", "competition index"]);
  const lowBidIndex = findIndex(["top of page bid (low range)", "low range"]);
  const highBidIndex = findIndex(["top of page bid (high range)", "high range"]);
  if (keywordIndex === -1) return [];
  return rows.slice(1).map((row) => ({
    keyword: row[keywordIndex] ?? "",
    avgMonthlySearches: parseNumber(row[volumeIndex]),
    competition: row[competitionIndex] ?? null,
    competitionIndex: parseNumber(row[competitionScoreIndex]),
    lowTopOfPageBid: parseNumber(row[lowBidIndex]),
    highTopOfPageBid: parseNumber(row[highBidIndex]),
    source: "keyword-planner-csv"
  })).filter((row) => row.keyword.trim());
}

export function parseCsv(csv: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;
  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const next = csv[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i++;
      row.push(value);
      result.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  row.push(value);
  result.push(row);
  return result.filter((r) => r.some((cell) => cell.trim()));
}
