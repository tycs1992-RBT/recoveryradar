import { NextResponse } from "next/server";
import { z } from "zod";
import { scoreLead } from "@/lib/lead-scoring";

const scoreSchema = z.object({
  companyName: z.string().optional(),
  contactRole: z.string().optional(),
  clinicSize: z.coerce.number().int().optional(),
  serviceModel: z.string().optional(),
  status: z.string().optional(),
  signals: z.array(z.object({ type: z.string(), detail: z.string().optional().nullable() })).optional().default([])
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = scoreSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid scoring input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const scoring = scoreLead(parsed.data);
  return NextResponse.json({ scoring, ok: true });
}
