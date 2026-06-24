import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildRadarQuery,
  dedupeRadarResults,
  emrShoppingKeywords,
  normalizeRadarResult,
  type RadarPlatform
} from "@/lib/emr-shopping-radar";
import type { SearchItem } from "@/lib/public-signal-intelligence";

const radarSchema = z.object({
  keywords: z.array(z.string().trim()).max(25).optional(),
  location: z.string().trim().default("United States"),
  platforms: z.array(z.enum(["google", "facebook", "linkedin", "reddit", "news", "blogs"])).default(["facebook", "linkedin", "reddit", "google", "news", "blogs"]),
  maxPerQuery: z.coerce.number().int().min(1).max(10).default(5),
  recency: z.enum(["day", "week", "month"]).default("week"),
  saveToBank: z.coerce.boolean().default(false)
});

type SerpApiOrganicResult = { title?: string; link?: string; snippet?: string };
type SerpApiResponse = { organic_results?: SerpApiOrganicResult[]; error?: string };

function isCronAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

function recencyToTbs(recency: "day" | "week" | "month") {
  if (recency === "day") return "qdr:d";
  if (recency === "month") return "qdr:m";
  return "qdr:w";
}

function recencyToDateRestrict(recency: "day" | "week" | "month") {
  if (recency === "day") return "d1";
  if (recency === "month") return "m1";
  return "w1";
}

async function searchWithSerpApi(query: string, location: string, apiKey: string, maxPerQuery: number, recency: "day" | "week" | "month") {
  const url = new URL("https://serpapi.com/search");
  url.searchParams.set("engine", "google");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("q", query);
  url.searchParams.set("num", String(maxPerQuery));
  url.searchParams.set("gl", "us");
  url.searchParams.set("tbs", recencyToTbs(recency));
  if (location) url.searchParams.set("location", location);

  const response = await fetch(url, { next: { revalidate: 3600 } });
  const data = (await response.json()) as SerpApiResponse;
  if (!response.ok || data.error) throw new Error(data.error ?? `SerpApi status ${response.status}`);
  return (data.organic_results ?? []).map((item) => ({ title: item.title, link: item.link, snippet: item.snippet })) satisfies SearchItem[];
}

async function searchWithGoogleCustom(query: string, apiKey: string, cx: string, maxPerQuery: number, recency: "day" | "week" | "month") {
  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("cx", cx);
  url.searchParams.set("q", query);
  url.searchParams.set("num", String(Math.min(maxPerQuery, 10)));
  url.searchParams.set("dateRestrict", recencyToDateRestrict(recency));

  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (!response.ok) throw new Error((await response.text()).slice(0, 300));
  const data = await response.json() as { items?: SearchItem[] };
  return data.items ?? [];
}

async function saveResultsToBank(results: ReturnType<typeof dedupeRadarResults>) {
  if (!process.env.DATABASE_URL) return { saved: 0, notice: "DATABASE_URL is not configured; radar results were not persisted." };
  let saved = 0;

  for (const result of results) {
    const companyName = result.inferredCompany || result.title;
    const existing = await prisma.lead.findFirst({
      where: {
        OR: [
          { sourceUrl: result.link },
          { companyName: { equals: companyName, mode: "insensitive" } }
        ]
      }
    });
    const notes = [
      existing?.notes,
      `EMR Shopping Radar source: ${result.link}`,
      `Platform: ${result.platform}`,
      `Keyword: ${result.keyword}`,
      `Query: ${result.query}`,
      `Snippet: ${result.snippet}`,
      `Shopping intent: ${result.shoppingIntentScore}`,
      `Pain level: ${result.painLevelScore}`,
      `Decision-maker probability: ${result.decisionMakerProbability}`,
      `Clinic probability: ${result.clinicProbability}`,
      `Risk note: ${result.riskNote}`
    ].filter(Boolean).join("\n");

    if (existing) {
      await prisma.lead.update({
        where: { id: existing.id },
        data: {
          leadScore: Math.max(existing.leadScore ?? 0, result.leadScore),
          sourceUrl: existing.sourceUrl || result.link,
          notes
        }
      });
    } else {
      await prisma.lead.create({
        data: {
          source: "IMPORT",
          companyName,
          sourceUrl: result.link,
          painPoint: result.suggestedSignal,
          leadScore: result.leadScore,
          nextStep: result.nextStep,
          notes
        }
      });
    }
    saved += 1;
  }

  return { saved, notice: `Saved ${saved} deduped radar result${saved === 1 ? "" : "s"} to lead/intelligence storage.` };
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const cronAuthorized = isCronAuthorized(request);
  if (!session?.user && !cronAuthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = radarSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid radar request", issues: parsed.error.flatten() }, { status: 400 });

  const serpApiKey = process.env.SERPAPI_API_KEY;
  const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const googleCx = process.env.GOOGLE_SEARCH_CX;
  const keywords = parsed.data.keywords?.length ? parsed.data.keywords : emrShoppingKeywords;
  const results = [];
  const errors: string[] = [];

  if (!serpApiKey && (!googleApiKey || !googleCx)) {
    return NextResponse.json({
      results: [],
      saved: 0,
      notice: "Add SERPAPI_API_KEY or GOOGLE_SEARCH_API_KEY + GOOGLE_SEARCH_CX in Vercel to run EMR Shopping Radar. Facebook mode uses public indexed Facebook pages/posts; Meta does not provide unrestricted private-group search."
    });
  }

  for (const keyword of keywords) {
    for (const platform of parsed.data.platforms as RadarPlatform[]) {
      const query = buildRadarQuery(keyword, platform, parsed.data.location);
      try {
        const items = serpApiKey
          ? await searchWithSerpApi(query, parsed.data.location, serpApiKey, parsed.data.maxPerQuery, parsed.data.recency)
          : await searchWithGoogleCustom(query, googleApiKey as string, googleCx as string, parsed.data.maxPerQuery, parsed.data.recency);
        results.push(...items.map((item) => normalizeRadarResult(item, { keyword, query, platform })));
      } catch (error) {
        errors.push(`${platform} / ${keyword}: ${error instanceof Error ? error.message : "search failed"}`);
      }
    }
  }

  const deduped = dedupeRadarResults(results).slice(0, 100);
  const saveResult = parsed.data.saveToBank ? await saveResultsToBank(deduped) : { saved: 0, notice: "Preview only. Turn on Save to Bank to persist reviewed radar results." };

  return NextResponse.json({
    results: deduped,
    count: deduped.length,
    saved: saveResult.saved,
    errors: errors.slice(0, 10),
    notice: `${deduped.length} EMR shopping signal${deduped.length === 1 ? "" : "s"} found. ${saveResult.notice}`
  });
}

export async function GET(request: Request) {
  const cronAuthorized = isCronAuthorized(request);
  const session = await getServerSession(authOptions);
  if (!session?.user && !cronAuthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = {
    location: "United States",
    platforms: ["facebook", "linkedin", "reddit", "google", "news", "blogs"],
    keywords: emrShoppingKeywords.slice(0, 8),
    maxPerQuery: 3,
    recency: "week",
    saveToBank: cronAuthorized
  };
  const cloned = new Request(request.url, { method: "POST", headers: request.headers, body: JSON.stringify(payload) });
  return POST(cloned);
}
