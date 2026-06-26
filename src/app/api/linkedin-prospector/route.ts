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

type SerpApiResult = {
  title?: string;
  link?: string;
  snippet?: string;
  displayed_link?: string;
};

type SerpApiResponse = {
  organic_results?: SerpApiResult[];
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

function parseProfile(result: SerpApiResult, keyword: string, location: string, sourceQuery: string, titles: string[]): ExecutiveProspect | null {
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
  const roleQuery = titles.slice(0, 10).map((title) => `\"${title}\"`).join(" OR ");
  const locationPart = location ? ` \"${location}\"` : "";
  return `site:linkedin.com/in (${roleQuery}) \"${keyword}\"${locationPart}`;
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

async function searchGoogleCustom(query: string, apiKey: string, cx: string, maxResults: number): Promise<SerpApiResult[]> {
  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("cx", cx);
  url.searchParams.set("q", query);
  url.searchParams.set("num", String(Math.min(maxResults, 10)));

  const response = await fetch(url, { next: { revalidate: 1800 } });
  if (!response.ok) throw new Error(`Google Custom Search failed: ${(await response.text()).slice(0, 200)}`);
  const data = (await response.json()) as { items?: Array<{ title?: string; link?: string; snippet?: string }> };
  // Map Google's item shape onto the same fields parseProfile reads from SerpApi results.
  return (data.items ?? []).map((item) => ({ title: item.title, link: item.link, snippet: item.snippet }));
}

// Prefer Google Custom Search (100/day free); fall back to SerpApi on failure or if Google
// isn't configured. Returns both the results and which provider produced them.
async function runProspectSearch(
  query: string,
  maxResults: number,
  keys: { serpApiKey?: string; googleApiKey?: string; googleCx?: string }
): Promise<{ results: SerpApiResult[]; provider: string }> {
  const googleReady = Boolean(keys.googleApiKey && keys.googleCx);
  if (googleReady) {
    try {
      return { results: await searchGoogleCustom(query, keys.googleApiKey as string, keys.googleCx as string, maxResults), provider: "Google Custom Search" };
    } catch (googleError) {
      if (!keys.serpApiKey) throw googleError;
      return { results: await searchSerpApi(query, keys.serpApiKey, maxResults), provider: "SerpApi (fallback)" };
    }
  }
  return { results: await searchSerpApi(query, keys.serpApiKey as string, maxResults), provider: "SerpApi" };
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

  const serpApiKey = process.env.SERPAPI_API_KEY;
  const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const googleCx = process.env.GOOGLE_SEARCH_CX;
  const googleReady = Boolean(googleApiKey && googleCx);
  if (!serpApiKey && !googleReady) {
    return NextResponse.json({
      prospects: [],
      notice: "No search key configured. Add GOOGLE_SEARCH_API_KEY + GOOGLE_SEARCH_CX (100/day free) or SERPAPI_API_KEY in Vercel to search Google-indexed public LinkedIn profile results."
    });
  }

  const { keywords, location, titles, maxResults } = parsed.data;
  const prospects = new Map<string, ExecutiveProspect>();
  const errors: string[] = [];
  let providerUsed = googleReady ? "Google Custom Search" : "SerpApi";

  for (const keyword of keywords.slice(0, 10)) {
    const query = buildQuery(keyword, location, titles);
    try {
      const { results, provider } = await runProspectSearch(query, maxResults, { serpApiKey, googleApiKey, googleCx });
      providerUsed = provider;
      for (const result of results) {
        const parsedProfile = parseProfile(result, keyword, location, query, titles);
        if (parsedProfile) prospects.set(parsedProfile.id, parsedProfile);
      }
    } catch (error) {
      errors.push(`${keyword}: ${error instanceof Error ? error.message : "Search failed"}`);
    }
  }

  return NextResponse.json({
    prospects: Array.from(prospects.values()).sort((a, b) => b.confidence - a.confidence),
    errors,
    provider: providerUsed,
    notice: `Executive prospects returned via ${providerUsed} (Google-indexed public LinkedIn profile results). Manual review required. Do not automate LinkedIn login, scraping, or messaging.`
  });
}
