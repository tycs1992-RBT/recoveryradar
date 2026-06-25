import { inferSignal, guessCompany, leadTemperatureFromSignal, whySignalMatters, type SearchItem } from "@/lib/public-signal-intelligence";
import { scoreReasonsForDisplay } from "@/lib/score-reasons-ui";

export type RadarPlatform = "google" | "facebook" | "linkedin" | "reddit" | "news" | "blogs";

export type RadarResult = {
  title: string;
  link: string;
  snippet: string;
  platform: RadarPlatform;
  query: string;
  keyword: string;
  inferredCompany: string;
  suggestedSignal: string;
  leadTemperature: "hot" | "warm" | "research";
  shoppingIntentScore: number;
  painLevelScore: number;
  decisionMakerProbability: number;
  clinicProbability: number;
  leadScore: number;
  scoreReasons: ReturnType<typeof scoreReasonsForDisplay>;
  whyItMatters: string;
  nextStep: string;
  riskNote: string;
};

export const emrShoppingKeywords = [
  "CentralReach alternative",
  "Motivity alternative",
  "ABA software recommendation",
  "best ABA EMR",
  "looking for ABA software",
  "switching from CentralReach",
  "Rethink alternative",
  "ABA EMR comparison",
  "ABA practice management software recommendation",
  "ABA billing scheduling software recommendation",
  "ABA clinic software alternative",
  "ABA data collection software alternative"
];

const platformDomains: Record<RadarPlatform, string> = {
  google: "",
  facebook: "site:facebook.com",
  linkedin: "site:linkedin.com",
  reddit: "site:reddit.com",
  news: "(site:prnewswire.com OR site:businesswire.com OR site:globenewswire.com OR site:news.google.com)",
  blogs: "(site:medium.com OR site:substack.com OR site:wordpress.com OR site:blogspot.com)"
};

const buyerTerms = "(alternative OR replacement OR recommend OR recommendation OR review OR compare OR vs OR switching OR migrate OR migration OR frustrated OR problem OR issue OR complaint OR looking)";
const abaTerms = '("ABA clinic" OR "ABA therapy" OR BCBA OR RBT OR autism OR "behavior analyst")';
const negativeTerms = "-jobs -salary -course -training -certification -CEU -exam -near -diagnosis";

export function buildRadarQuery(keyword: string, platform: RadarPlatform, location = "United States") {
  const domain = platformDomains[platform];
  const locationPart = location ? ` "${location}"` : "";
  if (platform === "google") {
    return `"${keyword}" ${abaTerms} ${buyerTerms} ${negativeTerms}${locationPart}`.replace(/\s+/g, " ").trim();
  }
  if (platform === "facebook") {
    return `${domain} "${keyword}" ${abaTerms} ${buyerTerms} ${negativeTerms}${locationPart}`.replace(/\s+/g, " ").trim();
  }
  if (platform === "linkedin") {
    return `${domain} "${keyword}" ${abaTerms} (owner OR founder OR CEO OR director OR operations OR clinic) ${buyerTerms} ${negativeTerms}${locationPart}`.replace(/\s+/g, " ").trim();
  }
  if (platform === "reddit") {
    return `${domain} "${keyword}" (ABA OR BCBA OR RBT OR autism) ${buyerTerms} ${negativeTerms}${locationPart}`.replace(/\s+/g, " ").trim();
  }
  return `${domain} "${keyword}" ${abaTerms} ${buyerTerms} ${negativeTerms}${locationPart}`.replace(/\s+/g, " ").trim();
}

function scoreText(text: string, pattern: RegExp, hot = 90, warm = 65, cold = 30) {
  const lower = text.toLowerCase();
  if (pattern.test(lower)) return hot;
  if (/aba|bcba|rbt|autism|clinic|therapy/.test(lower)) return warm;
  return cold;
}

export function normalizeRadarResult(item: SearchItem, context: { keyword: string; query: string; platform: RadarPlatform }): RadarResult {
  const title = item.title ?? "Untitled public result";
  const snippet = item.snippet ?? "";
  const link = item.link ?? "#";
  const text = `${title} ${snippet}`;
  const signal = inferSignal(text);
  const scoreReasons = scoreReasonsForDisplay({ title, snippet, sourceSignal: signal });
  const shoppingIntentScore = scoreText(text, /alternative|replacement|recommend|review|compare|vs|switching|migrate|migration|looking for|best/);
  const painLevelScore = scoreText(text, /frustrated|problem|issue|complaint|hate|struggling|pain|broken|expensive|hard|cancellation|callout|billing|scheduling|documentation|authorization/);
  const decisionMakerProbability = scoreText(text, /owner|founder|ceo|president|director|operations|clinic owner|bcba owner/);
  const clinicProbability = scoreText(text, /aba clinic|aba therapy|bcba|rbt|behavior analyst|autism therapy|center-based aba/);
  const leadScore = Math.round((shoppingIntentScore * 0.35) + (painLevelScore * 0.25) + (decisionMakerProbability * 0.2) + (clinicProbability * 0.2));

  return {
    title,
    link,
    snippet,
    platform: context.platform,
    query: context.query,
    keyword: context.keyword,
    inferredCompany: guessCompany(title),
    suggestedSignal: signal,
    leadTemperature: leadTemperatureFromSignal(signal, text),
    shoppingIntentScore,
    painLevelScore,
    decisionMakerProbability,
    clinicProbability,
    leadScore: Math.max(leadScore, scoreReasons.score),
    scoreReasons,
    whyItMatters: whySignalMatters(signal),
    nextStep: "Open the public source, verify ABA/business context, save to Intelligence Bank, then route to calculator or outreach approval. Do not scrape private groups or auto-message.",
    riskNote: context.platform === "facebook"
      ? "Facebook public indexed source only. Meta API does not provide unrestricted private-group/user search. Review manually before saving."
      : "Public indexed source only. Review manually before saving or using."
  };
}

export function dedupeRadarResults(results: RadarResult[]) {
  return Array.from(new Map(results.filter((result) => result.link && result.link !== "#").map((result) => [result.link, result])).values())
    .sort((a, b) => b.leadScore - a.leadScore || a.title.localeCompare(b.title));
}
