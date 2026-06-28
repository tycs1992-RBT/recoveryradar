import { requireWorkspace } from "@/lib/api-guard";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const clinicSchema = z.object({
  name: z.string().trim().min(1),
  status: z.enum(["Opening soon", "Newly opened"]).default("Opening soon"),
  location: z.string().trim().optional().default(""),
  website: z.string().trim().optional().default(""),
  facebook: z.string().trim().optional().default(""),
  instagram: z.string().trim().optional().default(""),
  notes: z.string().trim().optional().default("")
});

// GET /api/clinic-watch — list all tracked clinics (newest first).
export async function GET() {
  const denied = await requireWorkspace();
  if (denied) return denied;

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ clinics: [], source: "clean_slate", warning: "DATABASE_URL is not configured." });
  }
  try {
    const clinics = await prisma.clinicWatch.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
    return NextResponse.json({ clinics, source: "database" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ clinics: [], source: "database_error", error: "Database query failed." }, { status: 500 });
  }
}

// POST /api/clinic-watch — create a tracked clinic.
export async function POST(request: Request) {
  const denied = await requireWorkspace();
  if (denied) return denied;

  const parsed = clinicSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid clinic input", issues: parsed.error.flatten() }, { status: 400 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ clinic: parsed.data, persisted: false, warning: "DATABASE_URL is not configured." });
  }
  try {
    const clinic = await prisma.clinicWatch.create({ data: parsed.data });
    return NextResponse.json({ clinic, persisted: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save clinic." }, { status: 500 });
  }
}
