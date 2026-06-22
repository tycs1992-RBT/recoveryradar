import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const analyticsEventSchema = z.object({
  eventName: z.string().trim().min(1).default("page_view"),
  path: z.string().trim().min(1).default("/"),
  title: z.string().trim().optional(),
  referrer: z.string().trim().optional(),
  visitorId: z.string().trim().optional(),
  sessionId: z.string().trim().optional(),
  timeOnPageMs: z.number().nonnegative().optional(),
  metadata: z.record(z.unknown()).optional().default({})
});

type AnalyticsMeta = {
  title?: string;
  referrer?: string;
  visitorId?: string;
  sessionId?: string;
  timeOnPageMs?: number;
  userAgent?: string;
  country?: string;
  region?: string;
  city?: string;
  language?: string;
  timezone?: string;
  screen?: string;
  viewport?: string;
  href?: string;
};

type AnalyticsEventRow = {
  id: string;
  eventName: string;
  path: string | null;
  metadata: unknown;
  createdAt: Date;
};

function asMeta(value: unknown): AnalyticsMeta {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as AnalyticsMeta;
}

function hostFromReferrer(referrer?: string) {
  if (!referrer) return "Direct / none";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer.slice(0, 80);
  }
}

function deviceFromUserAgent(userAgent?: string) {
  const ua = (userAgent ?? "").toLowerCase();
  if (/mobile|iphone|android/.test(ua)) return "Mobile";
  if (/ipad|tablet/.test(ua)) return "Tablet";
  if (!ua) return "Unknown";
  return "Desktop";
}

function shortId(value?: string) {
  if (!value) return "anonymous";
  return value.replace(/^visitor_/, "").replace(/^session_/, "").slice(0, 8);
}

function increment(map: Map<string, number>, key: string, amount = 1) {
  map.set(key, (map.get(key) ?? 0) + amount);
}

function topEntries(map: Map<string, number>, limit = 10) {
  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, limit);
}

function buildSummary(events: AnalyticsEventRow[]) {
  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const pageViews = events.filter((event) => event.eventName === "page_view");
  const leaveEvents = events.filter((event) => event.eventName === "page_leave");
  const visitors = new Set<string>();
  const sessions = new Set<string>();
  const activeSessions = new Set<string>();
  const pages = new Map<string, number>();
  const referrers = new Map<string, number>();
  const devices = new Map<string, number>();
  const locations = new Map<string, number>();

  let todayViews = 0;
  let totalTime = 0;
  let totalTimeCount = 0;

  for (const event of events) {
    const meta = asMeta(event.metadata);
    if (meta.visitorId) visitors.add(meta.visitorId);
    if (meta.sessionId) sessions.add(meta.sessionId);
    if (meta.sessionId && now - event.createdAt.getTime() <= 5 * 60 * 1000) activeSessions.add(meta.sessionId);

    if (event.eventName === "page_view") {
      increment(pages, event.path ?? "/");
      increment(referrers, hostFromReferrer(meta.referrer));
      increment(devices, deviceFromUserAgent(meta.userAgent));
      const place = [meta.city, meta.region, meta.country].filter(Boolean).join(", ") || meta.country || "Unknown";
      increment(locations, place);
      if (event.createdAt >= todayStart) todayViews += 1;
    }

    if (event.eventName === "page_leave" && typeof meta.timeOnPageMs === "number" && meta.timeOnPageMs > 0 && meta.timeOnPageMs < 60 * 60 * 1000) {
      totalTime += meta.timeOnPageMs;
      totalTimeCount += 1;
    }
  }

  const recentVisitors = pageViews.slice(0, 50).map((event) => {
    const meta = asMeta(event.metadata);
    return {
      time: event.createdAt,
      visitor: shortId(meta.visitorId),
      session: shortId(meta.sessionId),
      path: event.path ?? "/",
      title: meta.title ?? "Untitled page",
      referrer: hostFromReferrer(meta.referrer),
      device: deviceFromUserAgent(meta.userAgent),
      location: [meta.city, meta.region, meta.country].filter(Boolean).join(", ") || meta.country || "Unknown"
    };
  });

  return {
    totals: {
      visitors: visitors.size,
      sessions: sessions.size,
      pageViews: pageViews.length,
      activeNow: activeSessions.size,
      todayViews,
      avgTimeOnPageSeconds: totalTimeCount ? Math.round(totalTime / totalTimeCount / 1000) : 0
    },
    topPages: topEntries(pages),
    topReferrers: topEntries(referrers),
    devices: topEntries(devices),
    locations: topEntries(locations),
    recentVisitors,
    eventCount: events.length,
    durationSamples: leaveEvents.length
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = analyticsEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ tracked: false, error: "Invalid analytics event" }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ tracked: false, source: "no_database" }, { status: 200 });
  }

  const data = parsed.data;
  const headers = request.headers;
  const metadata = {
    ...data.metadata,
    title: data.title,
    referrer: data.referrer,
    visitorId: data.visitorId,
    sessionId: data.sessionId,
    timeOnPageMs: data.timeOnPageMs,
    userAgent: headers.get("user-agent") ?? undefined,
    country: headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry") ?? undefined,
    region: headers.get("x-vercel-ip-country-region") ?? undefined,
    city: headers.get("x-vercel-ip-city") ?? undefined
  } satisfies AnalyticsMeta;

  try {
    await prisma.analyticsEvent.create({
      data: {
        eventName: data.eventName,
        path: data.path,
        metadata
      }
    });
    return NextResponse.json({ tracked: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ tracked: false, error: "Analytics write failed" }, { status: 200 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      source: "no_database",
      summary: buildSummary([]),
      notice: "DATABASE_URL is not configured, so no website traffic can be stored yet."
    });
  }

  try {
    const events = await prisma.analyticsEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 2500
    });

    return NextResponse.json({
      source: "database",
      summary: buildSummary(events),
      notice: "Anonymous public website traffic is being tracked. Visitor names are only known if they submit a form, log in, or identify themselves."
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      source: "database_error",
      summary: buildSummary([]),
      error: "Database analytics query failed."
    }, { status: 200 });
  }
}
