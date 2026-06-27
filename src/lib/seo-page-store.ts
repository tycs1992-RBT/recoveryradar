import { promises as fs } from "fs";
import path from "path";
import type { SeoLandingPage, SeoPageStatus } from "./seo-page-types";

/**
 * Store for SEO landing pages — with a runtime-persistent backend so the founder portal can
 * publish pages that go live INSTANTLY, without a commit + redeploy.
 *
 * TWO BACKENDS, selected automatically:
 *
 *  1. KV (Upstash Redis, REST) — used whenever the datastore env vars are present:
 *       KV_REST_API_URL + KV_REST_API_TOKEN          (Vercel Marketplace "Upstash" / legacy Vercel KV)
 *       …or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN  (Upstash direct)
 *     Writes persist across requests on Vercel's read-only serverless filesystem, so Publish
 *     in the portal makes the page live on the next request. On first use, the KV is SEEDED
 *     once from the committed data/seo-pages.json so existing pages carry over.
 *
 *  2. FILE (git-committed data/seo-pages.json) — the fallback when no KV env vars are set.
 *     This keeps local dev working exactly as before (writes hit the JSON file) and means the
 *     site degrades gracefully to "serve the committed pages" if KV is ever unconfigured —
 *     it never hard-crashes for lack of an env var.
 *
 * Every function is async and returns plain records, so swapping in Daniel's Postgres/Prisma
 * later is a drop-in: the API routes and the page renderer never touch a backend directly.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "seo-pages.json");

// Redis key layout: one hash, id -> JSON(page). O(1) by-id; full list via HGETALL.
const KV_HASH = "seo:pages";
const KV_SEEDED_FLAG = "seo:pages:seeded";

function kvCreds(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return { url, token };
  return null;
}

export function getStoreMode(): "kv" | "file" {
  return kvCreds() ? "kv" : "file";
}

/* ----------------------------- FILE backend ------------------------------ */

async function fileRead(): Promise<SeoLandingPage[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SeoLandingPage[]) : [];
  } catch {
    return [];
  }
}

async function fileWrite(pages: SeoLandingPage[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, `${JSON.stringify(pages, null, 2)}\n`, "utf8");
}

/* ------------------------------ KV backend ------------------------------- */

// Lazily construct a single Upstash Redis client. Imported dynamically so the package is only
// required when KV is actually configured (file-only deploys don't need it installed at runtime).
let kvClientPromise: Promise<{
  hgetall: (key: string) => Promise<Record<string, unknown> | null>;
  hget: (key: string, field: string) => Promise<unknown>;
  hset: (key: string, kv: Record<string, string>) => Promise<number>;
  hdel: (key: string, ...fields: string[]) => Promise<number>;
  hlen: (key: string) => Promise<number>;
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: string) => Promise<unknown>;
}> | null = null;

function getKv() {
  const creds = kvCreds();
  if (!creds) return null;
  if (!kvClientPromise) {
    kvClientPromise = import("@upstash/redis").then(
      ({ Redis }) =>
        new Redis({ url: creds.url, token: creds.token }) as unknown as NonNullable<
          Awaited<typeof kvClientPromise>
        >
    );
  }
  return kvClientPromise;
}

// Upstash auto-deserializes JSON values. Normalize whatever comes back to a typed page.
function coercePage(value: unknown): SeoLandingPage | null {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as SeoLandingPage;
    } catch {
      return null;
    }
  }
  if (typeof value === "object") return value as SeoLandingPage;
  return null;
}

// One-time seed: if the KV hash is empty, import the committed JSON so existing pages survive
// the cutover to KV. Guarded by a flag key so it only ever runs once per database.
async function kvSeedIfEmpty(kv: NonNullable<Awaited<ReturnType<typeof getKv>>>): Promise<void> {
  try {
    const already = await kv.get(KV_SEEDED_FLAG);
    if (already) return;
    const count = await kv.hlen(KV_HASH);
    if (count === 0) {
      const seedPages = await fileRead();
      if (seedPages.length > 0) {
        const entries: Record<string, string> = {};
        for (const page of seedPages) entries[page.id] = JSON.stringify(page);
        await kv.hset(KV_HASH, entries);
      }
    }
    await kv.set(KV_SEEDED_FLAG, "1");
  } catch {
    // Seeding is best-effort; a failure here must not take down reads.
  }
}

async function kvReadAll(): Promise<SeoLandingPage[]> {
  const kv = await getKv();
  if (!kv) return [];
  await kvSeedIfEmpty(kv);
  const map = await kv.hgetall(KV_HASH);
  if (!map) return [];
  const pages: SeoLandingPage[] = [];
  for (const value of Object.values(map)) {
    const page = coercePage(value);
    if (page) pages.push(page);
  }
  return pages;
}

async function kvPut(page: SeoLandingPage): Promise<void> {
  const kv = await getKv();
  if (!kv) return;
  await kv.hset(KV_HASH, { [page.id]: JSON.stringify(page) });
}

/* ------------------------- backend-agnostic core ------------------------- */

async function readAll(): Promise<SeoLandingPage[]> {
  return getStoreMode() === "kv" ? kvReadAll() : fileRead();
}

// Persist a single page (KV: targeted hash write; FILE: read-modify-write the whole array).
async function putOne(page: SeoLandingPage, allForFile: SeoLandingPage[]): Promise<void> {
  if (getStoreMode() === "kv") {
    await kvPut(page);
  } else {
    await fileWrite(allForFile);
  }
}

/* ------------------------------ public API ------------------------------- */

export async function listPages(): Promise<SeoLandingPage[]> {
  const pages = await readAll();
  return pages.sort((a, b) => ((b.updatedAt || "") > (a.updatedAt || "") ? 1 : -1));
}

export async function listPublishedPages(): Promise<SeoLandingPage[]> {
  const pages = await readAll();
  return pages.filter((page) => page.status === "PUBLISHED");
}

export async function getPageById(id: string): Promise<SeoLandingPage | null> {
  if (getStoreMode() === "kv") {
    const kv = await getKv();
    if (kv) {
      await kvSeedIfEmpty(kv);
      return coercePage(await kv.hget(KV_HASH, id));
    }
  }
  const pages = await readAll();
  return pages.find((page) => page.id === id) ?? null;
}

export async function getPageBySlug(slug: string): Promise<SeoLandingPage | null> {
  const pages = await readAll();
  return pages.find((page) => page.slug === slug) ?? null;
}

export async function getPublishedPageBySlug(slug: string): Promise<SeoLandingPage | null> {
  const page = await getPageBySlug(slug);
  return page && page.status === "PUBLISHED" ? page : null;
}

export async function savePage(page: SeoLandingPage): Promise<SeoLandingPage> {
  const pages = await readAll();
  const now = new Date().toISOString();
  const existingIndex = pages.findIndex((item) => item.id === page.id || item.slug === page.slug);
  const next: SeoLandingPage = { ...page, updatedAt: now };
  if (existingIndex >= 0) {
    next.createdAt = pages[existingIndex].createdAt;
    next.id = pages[existingIndex].id; // keep the stable id when matched by slug
    pages[existingIndex] = next;
  } else {
    next.createdAt = page.createdAt || now;
    pages.push(next);
  }
  await putOne(next, pages);
  return next;
}

export async function updatePage(
  id: string,
  patch: Partial<SeoLandingPage>
): Promise<SeoLandingPage | null> {
  const pages = await readAll();
  const index = pages.findIndex((page) => page.id === id);
  if (index < 0) return null;
  const updated: SeoLandingPage = { ...pages[index], ...patch, id, updatedAt: new Date().toISOString() };
  pages[index] = updated;
  await putOne(updated, pages);
  return updated;
}

export async function setPageStatus(
  id: string,
  status: SeoPageStatus,
  meta?: { approvedBy?: string }
): Promise<SeoLandingPage | null> {
  const now = new Date().toISOString();
  const patch: Partial<SeoLandingPage> = { status };
  if (status === "APPROVED") {
    patch.approvedAt = now;
    if (meta?.approvedBy) patch.approvedBy = meta.approvedBy;
  }
  if (status === "PUBLISHED") {
    patch.publishedAt = now;
    if (!patch.approvedAt) patch.approvedAt = now;
  }
  return updatePage(id, patch);
}
