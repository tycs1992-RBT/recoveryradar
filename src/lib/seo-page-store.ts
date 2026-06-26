import { promises as fs } from "fs";
import path from "path";
import type { SeoLandingPage, SeoPageStatus } from "./seo-page-types";

/**
 * File-backed store for SEO landing pages.
 *
 * The pages live in a git-committed JSON file (data/seo-pages.json). This matches the
 * Tyler workflow: author + publish locally, commit the JSON, push -> Vercel deploy makes
 * PUBLISHED pages live. (Vercel's serverless filesystem is read-only at runtime, so writes
 * only persist in local dev — which is exactly where authoring happens.)
 *
 * Every function here is async and returns plain records, so swapping this for a Prisma
 * implementation later is a drop-in: the API routes never touch the file directly.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "seo-pages.json");

async function readStore(): Promise<SeoLandingPage[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SeoLandingPage[]) : [];
  } catch {
    // No file yet (fresh checkout) — start empty.
    return [];
  }
}

async function writeStore(pages: SeoLandingPage[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, `${JSON.stringify(pages, null, 2)}\n`, "utf8");
}

export async function listPages(): Promise<SeoLandingPage[]> {
  const pages = await readStore();
  return pages.sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
}

export async function listPublishedPages(): Promise<SeoLandingPage[]> {
  const pages = await readStore();
  return pages.filter((page) => page.status === "PUBLISHED");
}

export async function getPageById(id: string): Promise<SeoLandingPage | null> {
  const pages = await readStore();
  return pages.find((page) => page.id === id) ?? null;
}

export async function getPageBySlug(slug: string): Promise<SeoLandingPage | null> {
  const pages = await readStore();
  return pages.find((page) => page.slug === slug) ?? null;
}

export async function getPublishedPageBySlug(slug: string): Promise<SeoLandingPage | null> {
  const page = await getPageBySlug(slug);
  return page && page.status === "PUBLISHED" ? page : null;
}

export async function savePage(page: SeoLandingPage): Promise<SeoLandingPage> {
  const pages = await readStore();
  const now = new Date().toISOString();
  const existingIndex = pages.findIndex((item) => item.id === page.id || item.slug === page.slug);
  const next: SeoLandingPage = { ...page, updatedAt: now };
  if (existingIndex >= 0) {
    next.createdAt = pages[existingIndex].createdAt;
    pages[existingIndex] = next;
  } else {
    next.createdAt = page.createdAt || now;
    pages.push(next);
  }
  await writeStore(pages);
  return next;
}

export async function updatePage(
  id: string,
  patch: Partial<SeoLandingPage>
): Promise<SeoLandingPage | null> {
  const pages = await readStore();
  const index = pages.findIndex((page) => page.id === id);
  if (index < 0) return null;
  const updated: SeoLandingPage = { ...pages[index], ...patch, id, updatedAt: new Date().toISOString() };
  pages[index] = updated;
  await writeStore(pages);
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
