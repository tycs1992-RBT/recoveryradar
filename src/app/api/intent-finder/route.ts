import { NextResponse } from "next/server";
import { z } from "zod";
import { inferSignal, guessCompany, leadTemperatureFromSignal, whySignalMatters, type SearchItem } from "@/lib/public-signal-intelligence";

const intentFinderSchema = z.object({
  keyword: z.string().min(2),
  location: z.string().optional().default(""),
  maxResults: z.coerce.number().int().min(1).max(20).optional().default(20)
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

type SerpApiResponse = {
  organic_results?: Array<{ title?: string; link?: string; snippet?: string }>;
  error?: string;
};

type BraveResponse = {
  web?: { results?: Array<{ title?: string; url?: string; description?: string }> };
  message?: string;
};

function normalizeResults(items: SearchItem[], query: string): SearchPreview[] {
  return items.filter((item) => item.link && item.link !== "#").map((item) => {
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

async function searchWithBrave(query: string, apiKey: string, maxResults: number) {
  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", String(Math.min(20, maxResults)));
  url.searchParams.set("country", "us");
  url.searchParams.set("search_lang", "en");
  url.searchParams.set("safesearch", "moderate");

  const response = await fetch(url, {
    headers: { Accept: "application/json", "X-Subscription-Token": apiKey },
    next: { revalidate: 900 }
  });
  const data = (await response.json()) as BraveResponse;
  if (!response.ok) throw new Error(data.message ?? `Brave Search failed with status ${response.status}`);

  return (data.web?.results ?? []).map((item) => ({
    title: item.title,
    link: item.url,
    snippet: item.description
  })) satisfies SearchItem[];
}

async function searchWithSerpApi(query: string, location: string, apiKey: string, maxResults: number) {
  const url = new URL("https://serpapi.com/search");
  url.searchParams.set("engine", "google");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("q", query);
  url.searchParams.set("num", String(Math.min(20, maxResults)));
  url.searchParams.set("gl", "us");
  if (location) url.searchParams.set("location", location);

  const response = await fetch(url, { next: { revalidate: 1800 } });
  const data = (await response.json()) as SerpApiResponse;
  if (!response.ok || data.error) throw new Error(data.error ?? `SerpApi request failed with status ${response.status}`);

  return (data.organic_results ?? []).map((item) => ({ title: item.title, link: item.link, snippet: item.snippet })) satisfies SearchItem[];
}

async function searchWithGoogleCustom(query: string, apiKey: string, cx: string, maxResults: number) {
  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("cx", cx);
  url.searchParams.set("q", query);
  url.searchParams.set("num", String(Math.min(10, maxResults)));

  const response = await fetch(url, { next: { revalidate: 1800 } });
  if (!response.ok) throw new Error(`Google Custom Search failed with status ${response.status}`);
  const data = await response.json() as { items?: SearchItem[] };
  return data.items ?? [];
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = intentFinderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid query" }, { status: 400 });

  const query = `${parsed.data.keyword}${parsed.data.location ? ` "${parsed.data.location}"` : ""}`.trim();
  const errors: string[] = [];
  let provider = "none";
  let items: SearchItem[] = [];

  if (process.env.BRAVE_SEARCH_API_KEY) {
    try {
      items = await searchWithBrave(query, process.env.BRAVE_SEARCH_API_KEY, parsed.data.maxResults);
      provider = "brave";
    } catch (error) {
      errors.push(`Brave Search: ${error instanceof Error ? error.message : "failed"}`);
    }
  }

  if (!items.length && process.env.SERPAPI_API_KEY) {
    try {
      items = await searchWithSerpApi(query, parsed.data.location, process.env.SERPAPI_API_KEY, parsed.data.maxResults);
      provider = "serpapi";
    } catch (error) {
      errors.push(`SerpApi: ${error instanceof Error ? error.message : "failed"}`);
    }
  }

  if (!items.length && process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_CX) {
    try {
      items = await searchWithGoogleCustom(query, process.env.GOOGLE_SEARCH_API_KEY, process.env.GOOGLE_SEARCH_CX, parsed.data.maxResults);
      provider = "google_custom";
    } catch (error) {
      errors.push(`Google Custom Search: ${error instanceof Error ? error.message : "failed"}`);
    }
  }

  const results = normalizeResults(items, query);
  return NextResponse.json({
    query,
    provider,
    results,
    errors,
    notice: provider === "none"
      ? "No working search provider returned results. Check BRAVE_SEARCH_API_KEY in Vercel."
      : `${results.length} public indexed result${results.length === 1 ? "" : "s"} returned through ${provider}. Review each source manually.`
  });
}
