import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";

const schema = z.object({
  keywords: z.array(z.string().trim().min(2)).min(1),
  location: z.string().trim().optional().default(""),
  titles: z.array(z.string().trim().min(2)).min(1),
  maxResults: z.number().min(1).max(10).default(5)
});

type SearchResult = {
  title?: string;
  link?: string;
  snippet?: string;
  displayed_link?: string;
};

type SerpApiResponse = {
  organic_results?: SearchResult[];
  error?: string;
};

type BraveSearchResponse = {
  web?: {
    results?: Array<{
      title?: string;
      url?: string;
      description?: string;
      profile?: { url?: string };
    }>;
  };
  message?: string;
  error?: string;
};

type ExecutiveProspect = {
  id: string;
  name: string;
  title: string;
  company: string;
  profileUrl: string;
  snippet: string;
  keyword: string;
  location: string;
  sourceQuery: string;
  confidence: number;
  nextStep: string;
};

function cleanLinkedInTitle(title: string) {
  return title
    .replace(/\s*\|\s*LinkedIn\s*$/i, "")
    .replace(/\s+-\s+LinkedIn\s*$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function inferRole(text: string, titles: string[]) {
  const lower = text.toLowerCase();
  const found = titles.find((title) => lower.includes(title.toLowerCase()));
  return found ?? "Executive / decision maker";
}

function parseProfile(result: SearchResult, keyword: string, location: string, sourceQuery: string, titles: string[]): ExecutiveProspect | null {
  const link = result.link ?? "";
  if (!/linkedin\.com\/in\//i.test(link)) return null;

  const rawTitle = cleanLinkedInTitle(result.title ?? "");
  const snippet = result.snippet ?? "";
  const parts = rawTitle.split(/\s[-–—]\s/).map((part) => part.trim()).filter(Boolean);
  const name = parts[0]?.replace(/\s{2,}/g, " ").trim() || "LinkedIn profile";
  const inferredRole = inferRole(`${rawTitle} ${snippet}`, titles);
  const title = parts.find((part, index) => index > 0 && titles.some((role) => part.toLowerCase().includes(role.toLowerCase()))) ?? inferredRole;
  const company = parts.find((part, index) => index > 1 && part !== title) ?? "Review profile for company";

  let confidence = 40;
  if (name !== "LinkedIn profile") confidence += 15;
  if (title !== "Executive / decision maker") confidence += 20;
  if (company !== "Review profile for company") confidence += 10;
  if (keyword && `${rawTitle} ${snippet}`.toLowerCase().includes(keyword.toLowerCase().split(" ")[0])) confidence += 5;
  if (location && `${rawTitle} ${snippet}`.toLowerCase().includes(location.toLowerCase())) confidence += 5;

  return {
    id: link.toLowerCase(),
    name,
    title,
    company,
    profileUrl: link,
    snippet,
    keyword,
    location,
    sourceQuery,
    confidence: Math.min(100, confidence),
    nextStep: "Open profile manually, confirm role/company fit, then copy the name into LinkedIn for a human-reviewed connection note."
  };
}

function buildQuery(keyword: string, location: string, titles: string[]) {
  const roleQuery = titles.slice(0, 10).map((title) => `"${title}"`).join(" OR ");
  const locationPart = location ? ` "${location}"` : "";
  return `site:linkedin.com/in (${roleQuery}) "${keyword}"${locationPart}`;
}

async function searchSerpApi(query: string, apiKey: string, maxResults: number) {
  const url = new URL("https://serpapi.com/search");
  url.searchParams.set("engine", "google");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("q", query);
  url.searchParams.set("num", String(maxResults));
  url.searchParams.set("gl", "us");

  const response = await fetch(url, { next: { revalidate: 1800 } });
  const data = (await response.json()) as SerpApiResponse;
  if (!response.ok || data.error) throw new Error(data.error ?? `SerpApi failed with status ${response.status}`);
  return data.organic_results ?? [];
}

async function searchBrave(query: string, apiKey: string, maxResults: number) {
  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", String(Math.min(20, Math.max(1, maxResults))));
  url.searchParams.set("country", "us");
  url.searchParams.set("search_lang", "en");
  url.searchParams.set("safesearch", "moderate");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": apiKey
    },
    next: { revalidate: 1800 }
  });
  const data = (await response.json()) as BraveSearchResponse;
  if (!response.ok || data.error) throw new Error(data.error || data.message || `Brave Search failed with status ${response.status}`);

  return (data.web?.results ?? []).map((item) => ({
    title: item.title,
    link: item.url ?? item.profile?.url,
    snippet: item.description,
    displayed_link: item.url
  })) satisfies SearchResult[];
}

async function searchWithAvailableProvider(query: string, maxResults: number) {
  const providerErrors: string[] = [];
  const braveKey = process.env.BRAVE_SEARCH_API_KEY;
  const serpKey = process.env.SERPAPI_API_KEY;

  if (braveKey) {
    try {
      return { provider: "brave", results: await searchBrave(query, braveKey, maxResults), providerErrors };
    } catch (error) {
      providerErrors.push(`Brave: ${error instanceof Error ? error.message : "failed"}`);
    }
  }

  if (serpKey) {
    try {
      return { provider: "serpapi", results: await searchSerpApi(query, serpKey, maxResults), providerErrors };
    } catch (error) {
      providerErrors.push(`SerpApi: ${error instanceof Error ? error.message : "failed"}`);
    }
  }

  return { provider: "none", results: [] as SearchResult[], providerErrors };
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse({
    ...body,
    maxResults: Number(body?.maxResults) || 5
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid LinkedIn prospector request", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { keywords, location, titles, maxResults } = parsed.data;
  const prospects = new Map<string, ExecutiveProspect>();
  const errors: string[] = [];
  const providers = new Set<string>();

  if (!process.env.BRAVE_SEARCH_API_KEY && !process.env.SERPAPI_API_KEY) {
    return NextResponse.json({
      prospects: [],
      provider: "none",
      errors: [],
      notice: "No search provider is configured. Add BRAVE_SEARCH_API_KEY in Vercel for the low-cost/free monthly credit search fallback, or add SERPAPI_API_KEY."
    });
  }

  for (const keyword of keywords.slice(0, 10)) {
    const query = buildQuery(keyword, location, titles);
    const search = await searchWithAvailableProvider(query, maxResults);
    providers.add(search.provider);
    errors.push(...search.providerErrors.map((message) => `${keyword}: ${message}`));

    for (const result of search.results) {
      const parsedProfile = parseProfile(result, keyword, location, query, titles);
      if (parsedProfile) prospects.set(parsedProfile.id, parsedProfile);
    }
  }

  const providerLabel = Array.from(providers).filter((provider) => provider !== "none").join(", ") || "none";
  return NextResponse.json({
    prospects: Array.from(prospects.values()).sort((a, b) => b.confidence - a.confidence),
    errors,
    provider: providerLabel,
    notice: `Executive prospects returned from Google/Brave-indexed public LinkedIn profile results using ${providerLabel}. Manual review required. Do not automate LinkedIn login, scraping, or messaging.`
  });
}
