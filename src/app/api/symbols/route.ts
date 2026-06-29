import { NextResponse } from "next/server";

/**
 * OpenSymbols search proxy.
 *
 * WHY THIS EXISTS: the OpenSymbols shared secret must NEVER reach the browser
 * (their rule — exposing it gets the key disabled). The Gestalt AAC app runs
 * client-side in the embedded sandbox, so it cannot hold the secret. This
 * server-side route holds the secret (OPENSYMBOLS_SECRET in env), exchanges it
 * for a short-lived access token, runs the search, and returns clean results.
 * The sandbox calls THIS route (same origin when embedded), never OpenSymbols
 * directly.
 *
 * COMMERCIAL-LICENSE FILTER: OpenSymbols aggregates many libraries, including
 * ARASAAC and Sclera which are CC BY-NC (non-commercial) and CANNOT ship in a
 * paid product. By default this route drops any result whose license contains
 * "NC", so the commercial app only ever sees symbols it may legally use. Pass
 * ?allowNonCommercial=1 only for internal/non-shipping use.
 *
 * Set OPENSYMBOLS_SECRET in your environment (Vercel). Never commit it.
 */

const OS_BASE = "https://www.opensymbols.org";

// Cache the short-lived token in module memory so we don't mint one per request.
let cachedToken: string | null = null;
let cachedTokenAt = 0;
const TOKEN_TTL_MS = 4 * 60 * 1000; // refresh well before expiry; on 401 we refetch anyway

async function getToken(secret: string, force = false): Promise<string> {
  const fresh = cachedToken && Date.now() - cachedTokenAt < TOKEN_TTL_MS;
  if (fresh && !force) return cachedToken as string;
  const res = await fetch(`${OS_BASE}/api/v2/token?secret=${encodeURIComponent(secret)}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`OpenSymbols token request failed (${res.status})`);
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("OpenSymbols token response missing access_token");
  cachedToken = data.access_token;
  cachedTokenAt = Date.now();
  return cachedToken;
}

// A license is commercial-safe if it does NOT carry the Non-Commercial (NC) clause.
function isCommercialSafe(license: string | null | undefined): boolean {
  if (!license) return false; // unknown license → exclude, to be safe
  return !/\bNC\b/i.test(license) && !/noncommercial/i.test(license);
}

type OsSymbol = {
  id: number;
  name: string;
  license?: string;
  license_url?: string;
  author?: string;
  author_url?: string;
  repo_key?: string;
  extension?: string;
  image_url?: string;
};

export async function GET(request: Request) {
  const secret = process.env.OPENSYMBOLS_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Symbol search is not configured (OPENSYMBOLS_SECRET missing)." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ error: "Missing search term (q)." }, { status: 400 });

  const locale = searchParams.get("locale") || "en";
  const allowNonCommercial = searchParams.get("allowNonCommercial") === "1";
  const limit = Math.min(Number(searchParams.get("limit") || 24), 60);

  async function search(token: string) {
    const url =
      `${OS_BASE}/api/v2/symbols?q=${encodeURIComponent(q)}` +
      `&access_token=${encodeURIComponent(token)}&locale=${encodeURIComponent(locale)}&safe=1`;
    return fetch(url);
  }

  try {
    let token = await getToken(secret);
    let res = await search(token);

    // Token expired → mint a fresh one once and retry.
    if (res.status === 401) {
      token = await getToken(secret, true);
      res = await search(token);
    }
    if (res.status === 429) {
      return NextResponse.json(
        { error: "Symbol search is busy right now, please try again in a moment." },
        { status: 429 }
      );
    }
    if (!res.ok) {
      return NextResponse.json({ error: `Symbol search failed (${res.status}).` }, { status: 502 });
    }

    const raw = (await res.json()) as OsSymbol[];
    const cleaned = raw
      .filter((s) => (allowNonCommercial ? true : isCommercialSafe(s.license)))
      .slice(0, limit)
      .map((s) => ({
        id: s.id,
        label: s.name,
        imageUrl: s.image_url,
        license: s.license,
        licenseUrl: s.license_url,
        author: s.author,
        source: s.repo_key,
        extension: s.extension,
      }));

    return NextResponse.json(
      { query: q, count: cleaned.length, results: cleaned },
      { headers: { "Cache-Control": "public, max-age=86400" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Symbol search error: ${message}` }, { status: 502 });
  }
}
