import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPageById, updatePage } from "@/lib/seo-page-store";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const page = await getPageById(id);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ page });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const patch = await request.json().catch(() => ({}));
  // Block direct jumps to PUBLISHED here — use the /publish action so publishedAt is stamped.
  if (patch?.status === "PUBLISHED") delete patch.status;
  const updated = await updatePage(id, patch);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Edits to a live page should appear immediately.
  revalidatePath(`/topics/${updated.slug}`);
  revalidatePath("/topics");
  return NextResponse.json({ page: updated });
}
