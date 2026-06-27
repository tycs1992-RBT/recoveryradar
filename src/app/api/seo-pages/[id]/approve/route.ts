import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { setPageStatus } from "@/lib/seo-page-store";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const approvedBy = session.user.email ?? "workspace";
  const page = await setPageStatus(id, "APPROVED", { approvedBy });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  revalidatePath(`/topics/${page.slug}`);
  return NextResponse.json({ page, notice: `Approved by ${approvedBy}. You can publish it now.` });
}
