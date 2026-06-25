import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { keywordGroups } from "@/lib/constants";

type SearchItem = {
  title?: string;
  link?: string;
  snippet?: string;
};

type SerpApiOrganicResult = {
  title?: string;
  link?: string;
  snippet?: string;
};

type SerpApiResponse = {
  organic_results?: SerpApiOrganicResult[];
  error?: string;
};

function inferSignal(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("opening") || lower.includes("new clinic") || lower.includes("opening soon") || lower.includes("expands")) return "new_clinic";
  if (lower.includes("scheduler") || lower.includes("intake coordinator") || lower.includes("operations manager")) return "hiring_scheduler";
  if (lower.includes("bcba") || lower.includes("rbt")) return "hiring_bcba";
  if (lower.includes("centralreach") || lower.includes("rethink") || lower.includes("motivity") || lower.includes("software implementation") || lower.includes("emr migration")) return "emr_shopping";
  if (lower.includes("cancellation") || lower.includes("callout") || lower.includes("staffing") || lower.includes("billing") || lower.includes("scheduling")) return "operations_pain";
  return "public_interest_signal";
}

function guessCompany(title: string) {
  if (!title) return "";
  return title
    .split(/[-–:|]/)[0]
    .replace(/\b(New ABA clinic|Press Release|Article|Blog|ABA)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function getKeywords(groupName: string) {
  if (process.env.DATABASE_URL) {
    try {
      const group = await prisma.keywordGroup.findUnique({ where: { groupName } });
      if (group?.keywords.length) return group.keywords;
    } catch (error) {
      console.error(error);
    }
  }

  const staticGroup = keywordGroups.find((group) => group.groupName === groupName);
  return staticGroup ? [...staticGroup.keywords] : [];
}

function cleanGoogleError(text: string) {
  try {
    const parsed = JSON.parse(text) as { error?: { message?: string; status?: string } };
    return parsed.error?.message ?? parsed.error?.status ?? text.slice(0, 700);
  } catch {
    return text.slice(0, 700);
  }
}

function normalizeResults(items: SearchItem[], query: string, keyword: string) {
  return items.map((item) => {
    const title = item.title ?? "Untitled public result";
    const snippet = item.snippet ?? "";
    return {
      keyword,
      query,
      title,
      link: item.link ?? "#",
      snippet,
      suggestedSignal: inferSignal(`${title} ${snippet}`),
      inferredCompany: guessCompany(title),
      nextStep: "Open source URL, verify ABA relevance, record only public business contact information, then add to CRM manually."
    };
  });
}

async function searchWithSerpApi(query: string, keyword: string, location: string, maxResults: number, apiKey: string) {
  const url = new URL("https://serpapi.com/search");
  url.searchParams.set("engine", "google");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("q", query);
  url.searchParams.set("num", String(maxResults));
  url.searchParams.set("gl", "us");
  if (location) url.searchParams.set("location", location);

  const response = await fetch(url, { next: { revalidate: 3600 } });
  const data = (await response.json()) as SerpApiResponse;

  if (!response.ok || data.error) {
    throw new Error(data.error ?? `SerpApi request failed with status ${response.status}`);
  }

  const items: SearchItem[] = (data.organic_results ?? []).map((item) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet
  }));

  return normalizeResults(items, query, keyword);
}

async function searchWithGoogleCustom(query: string, keyword: string, maxResults: number, apiKey: string, cx: string) {
  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("cx", cx);
  url.searchParams.set("q", query);
  url.searchParams.set("num", String(maxResults));

  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Custom Search failed with status ${response.status}: ${cleanGoogleError(errorText)}`);
  }

  const data = (await response.json()) as { items?: SearchItem[] };
  return normalizeResults(data.items ?? [], query, keyword);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const groupName = String(body?.groupName ?? "").trim();
  const location = String(body?.location ?? "").trim();
  const maxResults = Math.min(Math.max(Number(body?.maxResults) || 5, 1), 10);

  if (!groupName) {
    return NextResponse.json({ error: "groupName is required" }, { status: 400 });
  }

  const keywords = await getKeywords(groupName);
  if (!keywords.length) {
    return NextResponse.json({ error: `Keyword group '${groupName}' not found` }, { status: 404 });
  }

  const serpApiKey = process.env.SERPAPI_API_KEY;
  const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const googleCx = process.env.GOOGLE_SEARCH_CX;

  const results: Array<{
    keyword: string;
    query: string;
    title: string;
    link: string;
    snippet: string;
    suggestedSignal: string;
    inferredCompany: string;
    nextStep: string;
  }> = [];

  if (!serpApiKey && (!googleApiKey || !googleCx)) {
    return NextResponse.json({
      queryGroup: groupName,
      results: [],
      notice: "SERPAPI_API_KEY is not configured, and Google Custom Search credentials are also missing. No sample crawler results are returned in clean-slate mode.",
      configurationNeeded: ["SERPAPI_API_KEY"]
    });
  }

  for (const keyword of keywords) {
    const query = `${keyword} ${location}`.trim();

    try {
      if (serpApiKey) {
        results.push(...await searchWithSerpApi(query, keyword, location, maxResults, serpApiKey));
      } else if (googleApiKey && googleCx) {
        results.push(...await searchWithGoogleCustom(query, keyword, maxResults, googleApiKey, googleCx));
      }
    } catch (error) {
      results.push({
        keyword,
        query,
        title: `Search failed for “${query}”`,
        link: "#",
        snippet: error instanceof Error ? error.message : "Search request failed.",
        suggestedSignal: "manual_review_required",
        inferredCompany: "",
        nextStep: "Check SERPAPI_API_KEY in Vercel environment variables, account quota, or API access."
      });
    }
  }

  return NextResponse.json({
    queryGroup: groupName,
    results,
    notice: serpApiKey
      ? "Public search results returned through SerpApi Google Search. Review sources manually before adding leads."
      : "Public search results returned through Google Custom Search. Review sources manually before adding leads."
  });
}
