import { requireWorkspace } from "@/lib/api-guard";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  name: z.string().trim().min(1).optional(),
  status: z.enum(["Opening soon", "Newly opened"]).optional(),
  location: z.string().trim().optional(),
  website: z.string().trim().optional(),
  facebook: z.string().trim().optional(),
  instagram: z.string().trim().optional(),
  notes: z.string().trim().optional()
});

// PATCH /api/clinic-watch/:id — update a tracked clinic.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireWorkspace();
  if (denied) return denied;

  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update", issues: parsed.error.flatten() }, { status: 400 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ clinic: { id, ...parsed.data }, persisted: false, warning: "DATABASE_URL is not configured." });
  }
  try {
    const clinic = await prisma.clinicWatch.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ clinic, persisted: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Not found or update failed." }, { status: 404 });
  }
}

// DELETE /api/clinic-watch/:id — remove a tracked clinic.
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireWorkspace();
  if (denied) return denied;

  const { id } = await params;
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ deleted: false, warning: "DATABASE_URL is not configured." });
  }
  try {
    await prisma.clinicWatch.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Not found or delete failed." }, { status: 404 });
  }
}
