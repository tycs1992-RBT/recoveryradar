import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPageById, setPageStatus } from "@/lib/seo-page-store";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const existing = await getPageById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const page = await setPageStatus(id, "PUBLISHED");
  return NextResponse.json({
    page,
    notice:
      `Published. The page is live at /topics/${existing.slug} once data/seo-pages.json is committed and deployed. Next: submit https://www.infinitepieces.ai/topics/${existing.slug} in Google Search Console.`
  });
}
