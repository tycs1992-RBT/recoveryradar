import { NextResponse } from "next/server";
import { z } from "zod";
import { inferSignal, guessCompany, leadTemperatureFromSignal, whySignalMatters, type SearchItem } from "@/lib/public-signal-intelligence";

const intentFinderSchema = z.object({
  keyword: z.string().min(2),
  location: z.string().optional().default("")
});

type SearchPreview = {
  title: string;
  link: string;
  snippet: string;
  suggestedSignal: string;
  inferredCompany: string;
  leadTemperature: "hot" | "warm" | "research";
  whyItMatters: string;
  nextStep: string;
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

function normalizeResults(items: SearchItem[], query: string): SearchPreview[] {
  return items.map((item) => {
    const title = item.title ?? "Untitled public result";
    const snippet = item.snippet ?? "";
    const signal = inferSignal(`${title} ${snippet}`);
    return {
      title,
      link: item.link ?? "#",
      snippet,
      suggestedSignal: signal,
      inferredCompany: guessCompany(title),
      leadTemperature: leadTemperatureFromSignal(signal, `${title} ${snippet}`),
      whyItMatters: whySignalMatters(signal),
      nextStep: `Open the public source for “${query}”, verify ABA relevance and business context, then add only reviewed public business information to CRM.`
    };
  });
}

async function searchWithSerpApi(query: string, location: string, apiKey: string) {
  const url = new URL("https://serpapi.com/search");
  url.searchParams.set("engine", "google");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("q", query);
  url.searchParams.set("num", "5");
  url.searchParams.set("gl", "us");
  if (location) url.searchParams.set("location", location);

  const response = await fetch(url, { next: { revalidate: 1800 } });
  const data = (await response.json()) as SerpApiResponse;
  if (!response.ok || data.error) {
    throw new Error(data.error ?? `SerpApi request failed with status ${response.status}`);
  }

  const items: SearchItem[] = (data.organic_results ?? []).map((item) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet
  }));

  return normalizeResults(items, query);
}

async function searchWithGoogleCustom(query: string, apiKey: string, cx: string) {
  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("cx", cx);
  url.searchParams.set("q", query);
  url.searchParams.set("num", "5");

  const response = await fetch(url, { next: { revalidate: 1800 } });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Custom Search request failed: ${text.slice(0, 300)}`);
  }

  const data = await response.json() as { items?: SearchItem[] };
  return normalizeResults(data.items ?? [], query);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = intentFinderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const query = `${parsed.data.keyword} ${parsed.data.location}`.trim();
  const serpApiKey = process.env.SERPAPI_API_KEY;
  const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const googleCx = process.env.GOOGLE_SEARCH_CX;

  if (!serpApiKey && (!googleApiKey || !googleCx)) {
    return NextResponse.json({
      query,
      results: [],
      notice: "SERPAPI_API_KEY is not configured, and Google Custom Search credentials are also missing. No sample crawler results are returned in clean-slate mode."
    });
  }

  try {
    const results = serpApiKey
      ? await searchWithSerpApi(query, parsed.data.location, serpApiKey)
      : await searchWithGoogleCustom(query, googleApiKey as string, googleCx as string);

    return NextResponse.json({
      query,
      results,
      notice: serpApiKey
        ? "Public indexed results returned through SerpApi. Review every source manually before adding a lead."
        : "Public indexed results returned through Google Custom Search. Review every source manually before adding a lead."
    });
  } catch (error) {
    return NextResponse.json({
      query,
      results: [{
        title: `Search failed for “${query}”`,
        link: "#",
        snippet: error instanceof Error ? error.message : "Search request failed.",
        suggestedSignal: "manual_review_required",
        inferredCompany: "",
        leadTemperature: "research",
        whyItMatters: "The search provider rejected the request or quota is exhausted.",
        nextStep: "Check SERPAPI_API_KEY, account quota, or API access."
      }],
      notice: "Search failed. No fallback sample data returned."
    }, { status: 200 });
  }
}
