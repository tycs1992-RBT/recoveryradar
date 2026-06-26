import { NextResponse } from "next/server";
import { getPublishedPageBySlug } from "@/lib/seo-page-store";

// Public read — only ever returns PUBLISHED pages.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ page });
}
