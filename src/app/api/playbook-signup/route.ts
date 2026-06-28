import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Public route (no auth) — captures a playbook download as a Lead. Best-effort:
// if the DB isn't configured or the write fails, we still return ok so the reader
// gets the playbook. Uses source MANUAL + sourceUrl "/playbook" to avoid a schema change.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: { name?: string; email?: string; clinic?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email || "").trim();
  const name = (body.name || "").trim();
  const clinic = (body.clinic || "").trim();
  if (!EMAIL.test(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
  }

  // Capture is best-effort and must never block delivery of the playbook.
  if (process.env.DATABASE_URL) {
    try {
      await prisma.lead.create({
        data: {
          source: "MANUAL",
          sourceUrl: "/playbook",
          companyName: clinic || name || "(playbook download)",
          contactName: name || null,
          publicEmail: email,
          notes: "Downloaded the ABA Cancellation Recovery Playbook",
        },
      });
    } catch {
      // swallow — still deliver the playbook
    }
  }

  return NextResponse.json({ ok: true });
}
