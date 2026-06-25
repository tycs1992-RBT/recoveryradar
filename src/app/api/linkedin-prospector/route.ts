import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";

const schema = z.object({
  keywords: z.array(z.string().trim().min(2)).min(1),
  location: z.string().trim().optional().default(""),
  titles: z.array(z.string().trim().min(2)).min(1),
  maxResults: z.number().min(1).max(20).default(15)
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
  query?: {
    more_results_available?: boolean;
  };
  web?: {
    results?: Array<{
      title?: string;
      url?: string;
      description?: string;
      extra_snippets?: string[];
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
  const fullText = `${rawTitle} ${snippet}`;
  const parts = rawTitle.split(/\s[-–—|]\s/).map((part) => part.trim()).filter(Boolean);
  const name = parts[0]?.replace(/\s{2,}/g, " ").trim() || "LinkedIn profile";
  const inferredRole = inferRole(fullText, titles);
  const title = parts.find((part, index) => index > 0 && titles.some((role) => part.toLowerCase().includes(role.toLowerCase()))) ?? inferredRole;
  const company = parts.find((part, index) => index > 1 && part !== title) ?? "Review profile for company";

  let confidence = 40;
  if (name !== "LinkedIn profile") confidence += 15;
  if (title !== "Executive / decision maker") confidence += 20;
  if (company !== "Review profile for company") confidence += 10;
  if (keyword && fullText.toLowerCase().includes(keyword.toLowerCase().split(" ")[0])) confidence += 5;
  if (location && fullText.toLowerCase().includes(location.toLowerCase())) confidence += 5;

  return {
    id: link.toLowerCase().replace(/[?#].*$/, "").replace(/\/$/, ""),
    name,
    title,
    company,
    profileUrl: link,
    snippet,
    keyword,
    location,
    sourceQuery,
    confidence: Math.min(100, confidence),
    nextStep: "Open profile manually, confirm role/company/location fit, then copy the name into LinkedIn for a human-reviewed connection note."
  };
}

function nicheQuery(keyword: string) {
  const lower = keyword.toLowerCase();
  if (/aba|behavior analyst|autism/.test(lower)) {
    return '(ABA OR BCBA OR "Applied Behavior Analysis" OR "Autism Services" OR "Behavior Analyst")';
  }
  return `"${keyword}"`;
}

function buildQueryVariants(keyword: string, location: string, titles: string[]) {
  const niche = nicheQuery(keyword);
  const locationPart = location ? ` "${location}"` : "";
  const uniqueTitles = Array.from(new Set(titles)).slice(0, 12);
  const buckets = [uniqueTitles.slice(0, 4), uniqueTitles.slice(4, 8), uniqueTitles.slice(8, 12)].filter((bucket) => bucket.length);
  const queries = buckets.map((bucket) => {
    const roles = bucket.map((title) => `"${title}"`).join(" OR ");
    return `site:linkedin.com/in/ ${niche} (${roles})${locationPart}`;
  });

  queries.push(`site:linkedin.com/in/ ${niche} (founder OR owner OR CEO OR president OR director OR operations)${locationPart}`);
  return Array.from(new Set(queries));
}

async function searchSerpApi(query: string, apiKey: string, maxResults: number) {
  const url = new URL("https://serpapi.com/search");
  url.searchParams.set("engine", "google");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("q", query);
  url.searchParams.set("num", String(Math.min(20, maxResults)));
  url.searchParams.set("gl", "us");

  const response = await fetch(url, { next: { revalidate: 1800 } });
  const data = (await response.json()) as SerpApiResponse;
  if (!response.ok || data.error) throw new Error(data.error ?? `SerpApi failed with status ${response.status}`);
  return data.organic_results ?? [];
}

async function searchBrave(query: string, apiKey: string, maxResults: number) {
  const pages = Math.min(2, Math.ceil(maxResults / 20));
  const results: SearchResult[] = [];

  for (let offset = 0; offset < pages; offset += 1) {
    const remaining = maxResults - results.length;
    if (remaining <= 0) break;

    const url = new URL("https://api.search.brave.com/res/v1/web/search");
    url.searchParams.set("q", query);
    url.searchParams.set("count", String(Math.min(20, remaining)));
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("country", "us");
    url.searchParams.set("search_lang", "en");
    url.searchParams.set("safesearch", "moderate");
    url.searchParams.set("extra_snippets", "true");

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-Subscription-Token": apiKey
      },
      next: { revalidate: 900 }
    });
    const data = (await response.json()) as BraveSearchResponse;
    if (!response.ok || data.error) throw new Error(data.error || data.message || `Brave Search failed with status ${response.status}`);

    results.push(...(data.web?.results ?? []).map((item) => ({
      title: item.title,
      link: item.url ?? item.profile?.url,
      snippet: [item.description, ...(item.extra_snippets ?? [])].filter(Boolean).join(" ").slice(0, 1400),
      displayed_link: item.url
    })));

    if (!data.query?.more_results_available) break;
  }

  return results;
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
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse({
    ...body,
    maxResults: Number(body?.maxResults) || 15
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid LinkedIn prospector request", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { keywords, location, titles, maxResults } = parsed.data;
  const prospects = new Map<string, ExecutiveProspect>();
  const errors: string[] = [];
  const providers = new Set<string>();
  let queriesRun = 0;

  if (!process.env.BRAVE_SEARCH_API_KEY && !process.env.SERPAPI_API_KEY) {
    return NextResponse.json({
      prospects: [],
      provider: "none",
      errors: [],
      notice: "No search provider is configured. Add BRAVE_SEARCH_API_KEY or SERPAPI_API_KEY in Vercel."
    });
  }

  for (const keyword of keywords.slice(0, 6)) {
    const keywordProspects = new Map<string, ExecutiveProspect>();
    const queries = buildQueryVariants(keyword, location, titles);

    for (const query of queries) {
      if (keywordProspects.size >= maxResults) break;
      const search = await searchWithAvailableProvider(query, 20);
      queriesRun += 1;
      providers.add(search.provider);
      errors.push(...search.providerErrors.map((message) => `${keyword}: ${message}`));

      for (const result of search.results) {
        const profile = parseProfile(result, keyword, location, query, titles);
        if (!profile) continue;
        keywordProspects.set(profile.id, profile);
        prospects.set(profile.id, profile);
        if (keywordProspects.size >= maxResults) break;
      }
    }
  }

  const providerLabel = Array.from(providers).filter((provider) => provider !== "none").join(", ") || "none";
  const alphabetized = Array.from(prospects.values()).sort((a, b) => a.name.localeCompare(b.name) || a.company.localeCompare(b.company));

  return NextResponse.json({
    prospects: alphabetized,
    errors,
    provider: providerLabel,
    queriesRun,
    notice: `${alphabetized.length} alphabetized public LinkedIn profile result${alphabetized.length === 1 ? "" : "s"} returned using ${providerLabel} across ${queriesRun} focused searches. Manual role/company/location review is required.`
  });
}
