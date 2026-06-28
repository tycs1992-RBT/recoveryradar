import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUBLIC capture endpoint — anonymous site visitors POST here (via VisitorBeacon).
// No auth guard by design. It only writes a row; reads happen in the auth-gated
// /visitor-intel workspace view. Best-effort and fail-quiet throughout.

const HIGH_INTENT = ["/", "/pricing", "/calculator", "/quiz", "/provider-portal"];

function clientIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? null;
  return req.headers.get("x-real-ip");
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok: false });

  let path = "/";
  try {
    const body = await request.json();
    if (typeof body?.path === "string" && body.path) path = body.path.slice(0, 200);
  } catch {
    /* no/invalid body — default path */
  }

  const ip = clientIp(request);
  const referer = request.headers.get("referer");
  const userAgent = request.headers.get("user-agent");

  let company: string | null = null;
  let city: string | null = null;
  let region: string | null = null;
  let country: string | null = null;

  // Resolve IP -> company/org only when an IPinfo token is configured.
  const token = process.env.IPINFO_TOKEN;
  if (token && ip) {
    try {
      const r = await fetch(`https://ipinfo.io/${ip}/json?token=${token}`, { signal: AbortSignal.timeout(2500) });
      if (r.ok) {
        const d = (await r.json()) as { org?: string; city?: string; region?: string; country?: string };
        company = typeof d.org === "string" ? d.org.replace(/^AS\d+\s+/, "").trim() : null;
        city = d.city ?? null;
        region = d.region ?? null;
        country = d.country ?? null;
      }
    } catch {
      /* enrichment is best-effort; store the raw visit regardless */
    }
  }

  try {
    await prisma.visitorIntel.create({
      data: {
        path,
        ip: ip ?? undefined,
        company: company ?? undefined,
        city: city ?? undefined,
        region: region ?? undefined,
        country: country ?? undefined,
        referer: referer ?? undefined,
        userAgent: userAgent ?? undefined,
        isHighIntent: HIGH_INTENT.includes(path)
      }
    });
  } catch {
    /* table not migrated yet, or transient — ignore */
  }

  return NextResponse.json({ ok: true });
}
