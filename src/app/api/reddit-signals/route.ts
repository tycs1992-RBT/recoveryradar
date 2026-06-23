import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";

const redditSignalSchema = z.object({
  query: z.string().trim().min(3).default("ABA EMR CentralReach Rethink Motivity alternative problem recommend"),
  subreddits: z.array(z.string().trim()).optional().default(["all"]),
  limit: z.coerce.number().int().min(1).max(25).default(10),
  sort: z.enum(["relevance", "new", "comments", "top"]).default("new"),
  time: z.enum(["hour", "day", "week", "month", "year", "all"]).default("year")
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
  return process.env.REDDIT_USER_AGENT || "InfinitePiecesAI-RecoveryRadar/1.0 by tycs1992";
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

function buildSearchUrl(subreddit: string, query: string, limit: number, sort: string, time: string) {
  const normalized = normalizeSubreddit(subreddit);
  const base = normalized.toLowerCase() === "all" ? "https://oauth.reddit.com/search" : `https://oauth.reddit.com/r/${normalized}/search`;
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

function signalFromText(title: string, body: string) {
  const text = `${title} ${body}`.toLowerCase();
  if (/alternative|replacement|competitor|switch|switching/.test(text)) return "emr_replacement_shopping";
  if (/recommend|looking for|what do you use|best|compare|comparison| vs /.test(text)) return "emr_recommendation_shopping";
  if (/problem|issue|frustrated|hate|complain|pain/.test(text)) return "emr_complaint";
  return "emr_software_signal";
}

async function searchReddit(token: string, subreddit: string, query: string, limit: number, sort: string, time: string) {
  const url = buildSearchUrl(subreddit, query, limit, sort, time);
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": userAgent()
    },
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

  if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET) {
    return NextResponse.json({
      posts: [],
      notice: "Reddit API is not connected yet. Add REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in Vercel Environment Variables.",
      configurationNeeded: ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET", "REDDIT_USER_AGENT"]
    });
  }

  const { query, subreddits, limit, sort, time } = parsed.data;
  const token = await getRedditToken();
  const errors: string[] = [];
  const posts = new Map<string, Record<string, unknown>>();

  for (const subreddit of subreddits.length ? subreddits : ["all"]) {
    try {
      const results = await searchReddit(token, subreddit, query, limit, sort, time);
      for (const post of results) {
        const title = post?.title ?? "Untitled Reddit post";
        const selftext = post?.selftext ?? "";
        if (!isUsefulEmrPost(title, selftext)) continue;
        const permalink = post?.permalink ? `https://www.reddit.com${post.permalink}` : post?.url ?? "";
        if (!permalink) continue;
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
          signal: signalFromText(title, selftext),
          query,
          nextStep: "Open the Reddit thread, read context manually, and use it as market intelligence. Do not auto-message users or store private details."
        });
      }
    } catch (error) {
      errors.push(`${subreddit}: ${error instanceof Error ? error.message : "Reddit search failed"}`);
    }
  }

  return NextResponse.json({
    posts: Array.from(posts.values()),
    errors,
    notice: "Public Reddit posts returned through the official Reddit API. These are real public user posts, not website result pages. Manual review required."
  });
}
