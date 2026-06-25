import { auditEvent } from "@/lib/audit";

export const CONSENT_TEXT_VERSION = "public-conversion-consent-v2026-06-23";

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

export function requestIp(request: Request) {
  const headers = request.headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function requestFingerprint(request: Request, scope: string) {
  return [scope, requestIp(request), request.headers.get("user-agent") ?? "unknown"].join("|");
}

export function checkRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  buckets.set(key, existing);
  return { allowed: true, remaining: Math.max(0, limit - existing.count), resetAt: existing.resetAt };
}

export function hasBotTrap(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  const record = body as Record<string, unknown>;
  const trapValues = [record.companyWebsiteHidden, record.websiteHidden, record.hpWebsite, record.honeypot, record.faxNumber];
  return trapValues.some((value) => typeof value === "string" && value.trim().length > 0);
}

export function publicRequestMetadata(request: Request, extra: Record<string, unknown> = {}) {
  const headers = request.headers;
  return {
    ip: requestIp(request),
    userAgent: headers.get("user-agent") ?? undefined,
    referer: headers.get("referer") ?? undefined,
    origin: headers.get("origin") ?? undefined,
    country: headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry") ?? undefined,
    city: headers.get("x-vercel-ip-city") ?? undefined,
    consentTextVersion: CONSENT_TEXT_VERSION,
    ...extra
  };
}

export async function logPublicEndpointEvent(action: string, request: Request, after: Record<string, unknown>) {
  if (!process.env.DATABASE_URL) return;
  try {
    await auditEvent({
      action,
      entityType: "PublicEndpoint",
      after: publicRequestMetadata(request, after)
    });
  } catch {
    // non-blocking protection telemetry
  }
}
