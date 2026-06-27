import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPageById, setPageStatus, getStoreMode } from "@/lib/seo-page-store";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const existing = await getPageById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const page = await setPageStatus(id, "PUBLISHED");

  // Purge the caches so the new page, the /topics index, and the sitemap update immediately.
  revalidatePath(`/topics/${existing.slug}`);
  revalidatePath("/topics");
  revalidatePath("/sitemap.xml");

  const live = getStoreMode() === "kv";
  return NextResponse.json({
    page,
    live,
    notice: live
      ? `Published and live now at /topics/${existing.slug}. Next: submit https://www.infinitepieces.ai/topics/${existing.slug} in Google Search Console to speed up indexing.`
      : `Published. No datastore is connected, so this lives at /topics/${existing.slug} only after data/seo-pages.json is committed and deployed. Connect a datastore (KV_REST_API_URL/TOKEN) to make Publish go live instantly.`
  });
}
