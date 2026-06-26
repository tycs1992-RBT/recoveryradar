import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { listPages, savePage } from "@/lib/seo-page-store";
import type { SeoLandingPage } from "@/lib/seo-page-types";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const pages = await listPages();
  return NextResponse.json({ pages });
}

// The body is a full generated page object. We trust its shape loosely (it came from our own
// generator) but require the essentials and force a safe initial status.
const saveSchema = z
  .object({
    id: z.string().optional(),
    slug: z.string().trim().min(1),
    keyword: z.string().trim().min(1),
    h1: z.string().trim().min(1)
  })
  .passthrough();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid page payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const incoming = body as SeoLandingPage;
  // Never let a save jump straight to PUBLISHED — publishing is its own gated action.
  const status = incoming.status && incoming.status !== "PUBLISHED" ? incoming.status : "DRAFT";
  const saved = await savePage({ ...incoming, status });

  return NextResponse.json({
    page: saved,
    notice:
      "Saved. In local development this writes to data/seo-pages.json — commit and push that file to make published pages live on the site."
  });
}
