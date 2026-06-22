import { NextResponse } from "next/server";
import { z } from "zod";
import { buildPageBriefText, suggestSEOLandingPage } from "@/lib/seo-pages";

const schema = z.object({
  niche: z.string().trim().min(2).default("ABA clinic software"),
  locations: z.array(z.string().trim().min(2)).optional().default([]),
  goal: z.enum(["seo", "ads", "local", "all"]).default("all"),
  checkCompetition: z.boolean().optional().default(false)
});

type KeywordIdea = {
  keyword: string;
  cluster: string;
  intent: "informational" | "commercial" | "local" | "comparison" | "pain";
  demandTier: "High" | "Medium" | "Low";
  commercialIntent: number;
  suggestedPage: string;
  contentAngle: string;
  googleSearchUrl: string;
  googleTrendsUrl: string;
  competitionResults?: string;
  topResultTitles?: string[];
  pageTitle: string;
  pageH1: string;
  metaDescription: string;
  pageStatus: "published" | "planned";
  pageBrief: string;
  internalLinks: string[];
  faqQuestions: string[];
};

function uniq(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function classify(keyword: string): Pick<KeywordIdea, "intent" | "demandTier" | "commercialIntent" | "cluster"> {
  const lower = keyword.toLowerCase();
  if (/alternative|competitor|vs|compare/.test(lower)) {
    return {
      intent: "comparison",
      demandTier: "Medium",
      commercialIntent: 90,
      cluster: "Competitor / alternative"
    };
  }
  if (/near me|florida|new hampshire|massachusetts|texas|california|clinic|center/.test(lower)) {
    return {
      intent: "local",
      demandTier: "Medium",
      commercialIntent: 75,
      cluster: "Local demand"
    };
  }
  if (/software|system|emr|billing|scheduling|crm|management/.test(lower)) {
    return {
      intent: "commercial",
      demandTier: "High",
      commercialIntent: 85,
      cluster: "Commercial software/service"
    };
  }
  if (/cancellation|callout|staff|authorization|documentation|lost hours|revenue/.test(lower)) {
    return {
      intent: "pain",
      demandTier: "Medium",
      commercialIntent: 80,
      cluster: "Pain/problem"
    };
  }
  return {
    intent: "informational",
    demandTier: "Low",
    commercialIntent: 45,
    cluster: "Informational"
  };
}

function keywordUrl(keyword: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(keyword)}`;
}

function trendsUrl(keyword: string) {
  return `https://trends.google.com/trends/explore?geo=US&q=${encodeURIComponent(keyword)}`;
}

function buildIdeas(niche: string, locations: string[]) {
  const base = niche.trim();
  const core = [
    base,
    `${base} software`,
    `${base} system`,
    `${base} platform`,
    `${base} near me`,
    `best ${base}`,
    `${base} pricing`,
    `${base} reviews`
  ];
  const abaSeeds = [
    "ABA clinic software",
    "ABA therapy software",
    "ABA EMR software",
    "ABA practice management software",
    "CentralReach alternative",
    "Rethink alternative",
    "Motivity alternative",
    "ABA scheduling software",
    "ABA cancellation management",
    "ABA cancellation software",
    "ABA missed session recovery",
    "ABA recovered hours",
    "RBT callout coverage ABA",
    "ABA staff coverage software",
    "ABA authorization tracking",
    "ABA documentation readiness",
    "ABA software pricing",
    "active learner pricing",
    "how to open an ABA clinic",
    "ABA clinic startup software"
  ];
  const cabinetSeeds = [
    "bulk phone sales",
    "used phone buyers",
    "sell bulk phones",
    "wholesale phones",
    "kitchen cabinet company",
    "custom cabinet maker",
    "cabinet installer",
    "cabinet refacing",
    "RTA cabinets",
    "wholesale cabinets"
  ];
  const pain = [
    `how much money do ${base}s lose`,
    `${base} lead generation`,
    `${base} marketing`,
    `${base} CRM`,
    `${base} email outreach`,
    `${base} appointment scheduling`
  ];
  const local = locations.flatMap((location) => [
    `${base} ${location}`,
    `${base} near ${location}`,
    `best ${base} ${location}`,
    `${base} companies ${location}`
  ]);

  return uniq([...core, ...abaSeeds, ...cabinetSeeds, ...pain, ...local]).slice(0, 120);
}

async function enrichWithCustomSearch(ideas: KeywordIdea[]) {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;
  if (!apiKey || !cx) return { ideas, errors: ["GOOGLE_SEARCH_API_KEY or GOOGLE_SEARCH_CX missing; competition proxy skipped."] };

  const errors: string[] = [];
  const limited = ideas.slice(0, 20);
  const enriched: KeywordIdea[] = [];

  for (const idea of limited) {
    try {
      const url = new URL("https://www.googleapis.com/customsearch/v1");
      url.searchParams.set("key", apiKey);
      url.searchParams.set("cx", cx);
      url.searchParams.set("q", idea.keyword);
      url.searchParams.set("num", "3");
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        errors.push(`${idea.keyword}: ${response.status} ${text.slice(0, 160)}`);
        enriched.push(idea);
        continue;
      }
      const data = await response.json();
      enriched.push({
        ...idea,
        competitionResults: data.searchInformation?.formattedTotalResults ?? data.searchInformation?.totalResults,
        topResultTitles: (data.items ?? []).slice(0, 3).map((item: any) => item.title).filter(Boolean)
      });
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Custom Search competition check failed");
      enriched.push(idea);
    }
  }

  return { ideas: [...enriched, ...ideas.slice(20)], errors };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid keyword research request", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { niche, locations, checkCompetition } = parsed.data;
  const keywords = buildIdeas(niche, locations);
  const ideas = keywords.map((keyword) => {
    const meta = classify(keyword);
    const page = suggestSEOLandingPage(keyword);
    return {
      keyword,
      ...meta,
      suggestedPage: page.path,
      contentAngle: page.contentAngle,
      googleSearchUrl: keywordUrl(keyword),
      googleTrendsUrl: trendsUrl(keyword),
      pageTitle: page.title,
      pageH1: page.h1,
      metaDescription: page.metaDescription,
      pageStatus: "published",
      pageBrief: buildPageBriefText(page, [keyword]),
      internalLinks: page.internalLinks,
      faqQuestions: page.faqQuestions
    } satisfies KeywordIdea;
  });

  if (checkCompetition) {
    const enriched = await enrichWithCustomSearch(ideas);
    return NextResponse.json({
      notice: "Keyword ideas generated and mapped to publishable SEO pages. Competition count is a rough SERP proxy, not true search volume.",
      ideas: enriched.ideas,
      errors: enriched.errors
    });
  }

  return NextResponse.json({
    notice: "Keyword ideas generated and mapped to published SEO landing pages. Open the page URL, copy the brief, then submit the sitemap in Google Search Console.",
    ideas,
    errors: []
  });
}
