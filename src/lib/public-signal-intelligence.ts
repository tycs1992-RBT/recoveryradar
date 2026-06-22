export type PublicSignalSource = "web" | "reddit" | "facebook" | "discord";

export type SearchItem = {
  title?: string;
  link?: string;
  snippet?: string;
};

export type PublicSignalResult = {
  keyword: string;
  query: string;
  sourceType: PublicSignalSource;
  title: string;
  link: string;
  snippet: string;
  suggestedSignal: string;
  inferredCompany: string;
  leadTemperature: "hot" | "warm" | "research";
  whyItMatters: string;
  nextStep: string;
  riskNote: string;
};

export const publicSignalSourceLabels: Record<PublicSignalSource, string> = {
  web: "Open web",
  reddit: "Public Reddit",
  facebook: "Public Facebook",
  discord: "Public Discord"
};

const painTerms = [
  "cancellation",
  "cancelation",
  "callout",
  "no show",
  "makeup session",
  "scheduling",
  "scheduler",
  "staffing",
  "billing",
  "documentation",
  "authorization",
  "utilization",
  "caregiver communication",
  "parent communication",
  "centralreach",
  "rethink",
  "motivity",
  "catalyst"
];

function quoteIfNeeded(input: string) {
  const clean = input.trim();
  if (!clean) return "";
  return clean.includes(" ") ? `"${clean}"` : clean;
}

export function normalizeRequestedSources(input: unknown): PublicSignalSource[] {
  if (!Array.isArray(input)) return ["web"];
  const allowed = new Set<PublicSignalSource>(["web", "reddit", "facebook", "discord"]);
  const selected = input.filter((item): item is PublicSignalSource => allowed.has(item as PublicSignalSource));
  return selected.length ? Array.from(new Set(selected)) : ["web"];
}

export function buildPlatformQuery(keyword: string, location: string, source: PublicSignalSource) {
  const keywordPart = quoteIfNeeded(keyword);
  const locationPart = location ? quoteIfNeeded(location) : "";
  const abaContext = '"ABA clinic" OR "ABA therapy" OR BCBA OR RBT';
  const ownerContext = 'owner OR founder OR CEO OR director OR operations OR scheduler OR "clinic owner"';
  const painContext = '(cancellation OR cancelation OR callout OR scheduling OR billing OR documentation OR authorization OR caregiver)';

  if (source === "reddit") {
    return `site:reddit.com ${keywordPart} ${locationPart} (${abaContext}) (${ownerContext}) ${painContext}`.replace(/\s+/g, " ").trim();
  }

  if (source === "facebook") {
    return `site:facebook.com ${keywordPart} ${locationPart} ("ABA clinic" OR "ABA therapy" OR autism) (owner OR founder OR director OR hiring OR opening OR cancellation OR callout)`.replace(/\s+/g, " ").trim();
  }

  if (source === "discord") {
    return `(site:discord.gg OR site:discord.com/invite OR site:disboard.org) ${keywordPart} ${locationPart} (ABA OR autism OR BCBA OR RBT)`.replace(/\s+/g, " ").trim();
  }

  return `${keyword} ${location}`.trim();
}

export function inferSignal(text: string) {
  const lower = text.toLowerCase();
  if (/opening|new clinic|opening soon|grand opening|new location|expands|expanding/.test(lower)) return "new_or_expanding_clinic";
  if (/owner|founder|ceo|director|operations manager|clinical director/.test(lower)) return "possible_decision_maker";
  if (/hiring scheduler|intake coordinator|billing specialist|operations manager/.test(lower)) return "growth_ops_hiring";
  if (/hiring bcba|hiring rbt|rbt needed|bcba needed/.test(lower)) return "staff_growth_signal";
  if (/centralreach|rethink|motivity|catalyst|atrack|emr migration|software implementation|alternative/.test(lower)) return "emr_shopping_or_stack_pain";
  if (/cancellation|cancelation|callout|no show|makeup session|staffing|billing|scheduling|authorization|utilization|documentation|caregiver/.test(lower)) return "operations_pain";
  return "public_interest_signal";
}

export function leadTemperatureFromSignal(signal: string, text: string): PublicSignalResult["leadTemperature"] {
  const lower = text.toLowerCase();
  if (signal === "possible_decision_maker" || signal === "emr_shopping_or_stack_pain") return "hot";
  if (/complain|frustrated|struggling|problem|issue|pain|hate|need help|looking for|recommend/.test(lower)) return "hot";
  if (signal === "operations_pain" || signal === "new_or_expanding_clinic" || signal === "growth_ops_hiring") return "warm";
  return "research";
}

export function guessCompany(title: string) {
  if (!title) return "";
  return title
    .split(/[-–:|]/)[0]
    .replace(/\b(New ABA clinic|Press Release|Article|Blog|ABA|Facebook|Reddit|Discord|Disboard)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function whySignalMatters(signal: string) {
  if (signal === "possible_decision_maker") return "Possible owner, founder, director or operations buyer signal. Verify identity and business relevance before adding to CRM.";
  if (signal === "emr_shopping_or_stack_pain") return "Potential software-shopping or replacement pain. Use migration-vs-recovery positioning.";
  if (signal === "operations_pain") return "Public pain signal connected to cancellations, callouts, scheduling, billing, authorization, caregiver communication or documentation readiness.";
  if (signal === "new_or_expanding_clinic") return "New or expanding clinic may need startup stack, scheduling, billing, staffing and recovery workflows.";
  if (signal === "growth_ops_hiring") return "Hiring for scheduler, intake, billing or operations roles can signal growth and workflow pain.";
  if (signal === "staff_growth_signal") return "BCBA/RBT hiring may indicate growth, coverage strain, callout risk or staffing workflow needs.";
  return "Public source may contain useful context, but requires manual review before outreach.";
}

export function normalizeSignalResults(items: SearchItem[], query: string, keyword: string, sourceType: PublicSignalSource): PublicSignalResult[] {
  return items.map((item) => {
    const title = item.title ?? "Untitled public result";
    const snippet = item.snippet ?? "";
    const text = `${title} ${snippet}`;
    const signal = inferSignal(text);
    const leadTemperature = leadTemperatureFromSignal(signal, text);

    return {
      keyword,
      query,
      sourceType,
      title,
      link: item.link ?? "#",
      snippet,
      suggestedSignal: signal,
      inferredCompany: guessCompany(title),
      leadTemperature,
      whyItMatters: whySignalMatters(signal),
      nextStep: "Open the public source, verify ABA relevance and decision-maker/business context, then add only public business information to CRM.",
      riskNote: sourceType === "web" ? "Public web result. Manual review required." : `Public ${publicSignalSourceLabels[sourceType]} discovery only. Do not scrape private groups, log in, automate messages or collect personal/private details.`
    };
  });
}

export function publicPainQueries(location: string) {
  const locationPart = location ? ` ${location}` : "";
  return painTerms.map((term) => `ABA clinic ${term}${locationPart}`);
}
