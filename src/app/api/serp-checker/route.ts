import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  keyword: z.string().trim().min(2),
  num: z.coerce.number().int().min(1).max(10).optional().default(10)
});

type SerpResult = {
  rank: number;
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
};

type SerpApiResponse = {
  organic_results?: Array<{ title?: string; link?: string; snippet?: string; displayed_link?: string }>;
  search_information?: { total_results?: number; organic_results_state?: string };
  error?: string;
};

type GoogleCustomSearchResponse = {
  items?: Array<{ title?: string; link?: string; snippet?: string; displayLink?: string }>;
  searchInformation?: { formattedTotalResults?: string; totalResults?: string };
};

function buildGaps(results: SerpResult[]) {
  const combined = results.map((result) => `${result.title} ${result.snippet}`.toLowerCase()).join(" ");
  return [
    !combined.includes("calculator") && "Add a lost-hours calculator CTA above the fold.",
    !combined.includes("emr") && "Clarify that Infinite Suite is an EMR overlay, not a replacement.",
    !combined.includes("cancellation") && "Add cancellation/callout recovery examples.",
    !combined.includes("faq") && "Add FAQ schema-style questions for long-tail search.",
    !combined.includes("authorization") && "Mention auth utilization and review readiness."
  ].filter(Boolean);
}

async function searchWithSerpApi(keyword: string, num: number, apiKey: string) {
  const url = new URL("https://serpapi.com/search");
  url.searchParams.set("engine", "google");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("q", keyword);
  url.searchParams.set("num", String(num));
  url.searchParams.set("gl", "us");

  const response = await fetch(url, { next: { revalidate: 900 } });
  const data = (await response.json()) as SerpApiResponse;
  if (!response.ok || data.error) {
    return NextResponse.json({
      error: "SerpApi request failed",
      status: response.status,
      detail: data.error ?? "Unknown SerpApi error",
      googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(keyword)}`
    }, { status: 502 });
  }

  const results: SerpResult[] = (data.organic_results ?? []).map((item, index) => ({
    rank: index + 1,
    title: item.title ?? "Untitled",
    link: item.link ?? "#",
    snippet: item.snippet ?? "",
    displayLink: item.displayed_link ?? ""
  }));

  return NextResponse.json({
    keyword,
    provider: "serpapi",
    totalResults: data.search_information?.total_results ?? data.search_information?.organic_results_state ?? null,
    results,
    gaps: buildGaps(results),
    googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(keyword)}`,
    googleTrendsUrl: `https://trends.google.com/trends/explore?geo=US&q=${encodeURIComponent(keyword)}`
  });
}

async function searchWithGoogleCustom(keyword: string, num: number, apiKey: string, cx: string) {
  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("cx", cx);
  url.searchParams.set("q", keyword);
  url.searchParams.set("num", String(num));

  const response = await fetch(url, { next: { revalidate: 900 } });
  if (!response.ok) {
    const text = await response.text();
    return NextResponse.json({
      error: "Google Custom Search request failed",
      status: response.status,
      detail: text.slice(0, 1000),
      googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(keyword)}`
    }, { status: 502 });
  }

  const data = (await response.json()) as GoogleCustomSearchResponse;
  const results: SerpResult[] = (data.items ?? []).map((item, index) => ({
    rank: index + 1,
    title: item.title ?? "Untitled",
    link: item.link ?? "#",
    snippet: item.snippet ?? "",
    displayLink: item.displayLink ?? ""
  }));

  return NextResponse.json({
    keyword,
    provider: "google_custom_search",
    totalResults: data.searchInformation?.formattedTotalResults ?? data.searchInformation?.totalResults,
    results,
    gaps: buildGaps(results),
    googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(keyword)}`,
    googleTrendsUrl: `https://trends.google.com/trends/explore?geo=US&q=${encodeURIComponent(keyword)}`
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid SERP request", issues: parsed.error.flatten() }, { status: 400 });

  const { keyword, num } = parsed.data;
  const serpApiKey = process.env.SERPAPI_API_KEY;
  const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const googleCx = process.env.GOOGLE_SEARCH_CX;

  if (serpApiKey) return searchWithSerpApi(keyword, num, serpApiKey);
  if (googleApiKey && googleCx) return searchWithGoogleCustom(keyword, num, googleApiKey, googleCx);

  return NextResponse.json({
    keyword,
    results: [],
    gaps: [
      "SERPAPI_API_KEY is missing.",
      "Add SERPAPI_API_KEY in Vercel Environment Variables, then redeploy."
    ],
    googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(keyword)}`,
    googleTrendsUrl: `https://trends.google.com/trends/explore?geo=US&q=${encodeURIComponent(keyword)}`
  });
}
