import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { redditIntentQueries, scoreRedditPost } from "@/lib/public-signal-intelligence";

const redditSignalSchema = z.object({
  query: z.string().trim().min(3).default("ABA EMR CentralReach Rethink Motivity alternative problem recommend"),
  subreddits: z.array(z.string().trim()).optional().default(["all"]),
  limit: z.coerce.number().int().min(1).max(25).default(10),
  sort: z.enum(["relevance", "new", "comments", "top"]).default("new"),
  time: z.enum(["hour", "day", "week", "month", "year", "all"]).default("year"),
  // When true, ignore `query` and run the curated high-intent query set instead.
  useCuratedQueries: z.coerce.boolean().optional().default(false)
});

type RedditAccessToken = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
};

type RedditChild = {
  data?: {
    id?: string;
    name?: string;
    title?: string;
    selftext?: string;
    subreddit?: string;
    author?: string;
    permalink?: string;
    url?: string;
    score?: number;
    num_comments?: number;
    created_utc?: number;
    over_18?: boolean;
    is_self?: boolean;
  };
};

type RedditListing = {
  data?: {
    children?: RedditChild[];
  };
  message?: string;
  error?: number;
};

const jobNoise = ["job", "jobs", "salary", "hiring", "career", "indeed", "ziprecruiter", "glassdoor", "remote position", "available in"];
const emrTerms = ["emr", "ehr", "centralreach", "rethink", "motivity", "catalyst", "atrack", "software", "practice management", "data collection", "billing"];
const shoppingPainTerms = ["problem", "issue", "frustrated", "switch", "switching", "alternative", "replacement", "recommend", "looking for", "compare", "comparison", " vs ", "reviews", "best", "shopping", "what do you use"];

function basicAuthHeader(clientId: string, clientSecret: string) {
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
}

function userAgent() {
  return process.env.REDDIT_USER_AGENT || "InfinitePiecesAI-RecoveryRadar/1.0";
}

async function getRedditToken() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET are not configured.");

  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(clientId, clientSecret),
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": userAgent()
    },
    body: new URLSearchParams({ grant_type: "client_credentials" })
  });

  const data = (await response.json()) as RedditAccessToken;
  if (!response.ok || !data.access_token) throw new Error(data.error || `Reddit token request failed with status ${response.status}`);
  return data.access_token;
}

function normalizeSubreddit(value: string) {
  const clean = value.replace(/^r\//i, "").replace(/[^A-Za-z0-9_]/g, "").trim();
  return clean || "all";
}

function buildSearchUrl(subreddit: string, query: string, limit: number, sort: string, time: string, oauth: boolean) {
  const normalized = normalizeSubreddit(subreddit);
  const host = oauth ? "https://oauth.reddit.com" : "https://www.reddit.com";
  const base = normalized.toLowerCase() === "all" ? `${host}/search.json` : `${host}/r/${normalized}/search.json`;
  const url = new URL(base);
  url.searchParams.set("q", query);
  url.searchParams.set("sort", sort);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("t", time);
  url.searchParams.set("raw_json", "1");
  if (normalized.toLowerCase() !== "all") url.searchParams.set("restrict_sr", "1");
  return url;
}

function isUsefulEmrPost(title: string, body: string) {
  const text = `${title} ${body}`.toLowerCase();
  if (jobNoise.some((term) => text.includes(term))) return false;
  return emrTerms.some((term) => text.includes(term)) && shoppingPainTerms.some((term) => text.includes(term));
}

async function searchReddit(token: string | null, subreddit: string, query: string, limit: number, sort: string, time: string) {
  const oauth = Boolean(token);
  const url = buildSearchUrl(subreddit, query, limit, sort, time, oauth);
  const headers: Record<string, string> = { "User-Agent": userAgent() };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, {
    headers,
    next: { revalidate: 900 }
  });

  const data = (await response.json()) as RedditListing;
  if (!response.ok) throw new Error(data.message || `Reddit search failed with status ${response.status}`);

  return (data.data?.children ?? []).map((child) => child.data).filter(Boolean);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = redditSignalSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid Reddit signal request", issues: parsed.error.flatten() }, { status: 400 });

  const { query, subreddits, limit, sort, time, useCuratedQueries } = parsed.data;
  let token: string | null = null;
  const setupNotes: string[] = [];

  if (process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET) {
    try {
      token = await getRedditToken();
    } catch (error) {
      setupNotes.push(`Reddit OAuth failed, using public Reddit JSON fallback: ${error instanceof Error ? error.message : "unknown token error"}`);
    }
  } else {
    setupNotes.push("No Reddit app credentials found. Using public Reddit JSON fallback so you can keep working without the broken Reddit app setup.");
  }

  const errors: string[] = [];
  const posts = new Map<string, Record<string, unknown>>();

  // Build the list of (query) runs: curated set, or the single user query.
  const runs = useCuratedQueries ? redditIntentQueries().map((q) => q.query) : [query];
  const subs = subreddits.length ? subreddits : ["all"];

  for (const runQuery of runs) {
    for (const subreddit of subs) {
      try {
        const results = await searchReddit(token, subreddit, runQuery, limit, sort, time);
        for (const post of results) {
          const title = post?.title ?? "Untitled Reddit post";
          const selftext = post?.selftext ?? "";
          if (!isUsefulEmrPost(title, selftext)) continue;
          const permalink = post?.permalink ? `https://www.reddit.com${post.permalink}` : post?.url ?? "";
          if (!permalink) continue;
          if (posts.has(permalink)) continue; // dedup across all queries + subs
          const scored = scoreRedditPost({
            title,
            body: selftext,
            score: post?.score ?? 0,
            comments: post?.num_comments ?? 0,
            createdUtc: post?.created_utc ?? null
          });
          posts.set(permalink, {
            id: post?.name ?? post?.id ?? permalink,
            title,
            snippet: selftext.slice(0, 450) || "Public Reddit post matched EMR/software shopping or complaint language.",
            author: post?.author ? `u/${post.author}` : "Unknown Reddit user",
            subreddit: post?.subreddit ? `r/${post.subreddit}` : normalizeSubreddit(subreddit),
            permalink,
            score: post?.score ?? 0,
            comments: post?.num_comments ?? 0,
            createdAt: post?.created_utc ? new Date(post.created_utc * 1000).toISOString() : null,
            signal: scored.suggestedSignal,
            leadTemperature: scored.leadTemperature,
            whyItMatters: scored.whyItMatters,
            riskNote: scored.riskNote,
            matchedQuery: runQuery,
            nextStep: "Open the Reddit thread, read context manually, and use it as market intelligence. Do not auto-message users or store private details."
          });
        }
      } catch (error) {
        errors.push(`${subreddit} (${runQuery}): ${error instanceof Error ? error.message : "Reddit search failed"}`);
      }
    }
  }

  // Sort hottest-first so the best signals surface at the top.
  const tempRank: Record<string, number> = { hot: 0, warm: 1, research: 2 };
  const sortedPosts = Array.from(posts.values()).sort((a, b) => {
    const ta = tempRank[(a.leadTemperature as string) ?? "research"] ?? 2;
    const tb = tempRank[(b.leadTemperature as string) ?? "research"] ?? 2;
    if (ta !== tb) return ta - tb;
    return ((b.comments as number) ?? 0) - ((a.comments as number) ?? 0);
  });

  return NextResponse.json({
    posts: sortedPosts,
    queriesRun: runs,
    errors,
    setupNotes,
    source: token ? "reddit_oauth" : "reddit_public_json",
    notice: token
      ? "Public Reddit posts returned through Reddit OAuth, scored and sorted hottest-first. Manual review required."
      : "Public Reddit posts returned through the public Reddit JSON fallback, scored and sorted hottest-first. You can use this now without Reddit app credentials. Manual review required."
  });
}
