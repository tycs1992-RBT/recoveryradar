import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import {
  redditToIntelLead,
  placesToIntelLead,
  webSignalToIntelLead,
  linkedinToIntelLead,
  toBankRecords,
  type IntelLead
} from "@/lib/intel-pipeline";

/**
 * Unified capture endpoint — the single door from any scanner into the pipeline.
 *
 * The client sends the raw items it already has on screen from a scanner, tagged with
 * which source they came from. We normalize them to canonical IntelLeads, then forward
 * to the Intelligence Bank (which owns dedup + persistence). One call: scan results -> bank.
 *
 * Only PUBLIC business info is forwarded. Nothing here messages anyone — outreach stays
 * a separate, manual step.
 */

const captureSchema = z.object({
  source: z.enum(["reddit", "places", "web", "linkedin"]),
  // Loose: each scanner's items pass through; the normalizer picks the fields it needs.
  items: z.array(z.record(z.any())).min(1).max(200)
});

function normalizeBySource(source: string, items: Record<string, unknown>[]): IntelLead[] {
  switch (source) {
    case "reddit":
      return items.map((i) => redditToIntelLead(i));
    case "places":
      return items.map((i) => placesToIntelLead(i));
    case "web":
      return items.map((i) => webSignalToIntelLead(i));
    case "linkedin":
      return items.map((i) => linkedinToIntelLead(i));
    default:
      return [];
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = captureSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid capture request", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { source, items } = parsed.data;
  const leads = normalizeBySource(source, items as Record<string, unknown>[]);
  if (!leads.length) {
    return NextResponse.json({ captured: 0, notice: "No recognizable items to capture for this source." });
  }

  const bankBody = toBankRecords(leads);

  // Forward to the Intelligence Bank, preserving the caller's auth cookies so its
  // own session check passes. The bank does the dedup + persistence.
  const origin = new URL(request.url).origin;
  try {
    const bankResponse = await fetch(`${origin}/api/intelligence-bank`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: request.headers.get("cookie") ?? ""
      },
      body: JSON.stringify(bankBody)
    });

    const bankData = await bankResponse.json().catch(() => ({}));
    if (!bankResponse.ok) {
      return NextResponse.json(
        {
          captured: 0,
          forwarded: leads.length,
          notice: "Normalized leads, but the Intelligence Bank did not accept them (likely DATABASE_URL not configured). Leads were not persisted.",
          bankError: bankData
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      source,
      captured: leads.length,
      bank: bankData,
      notice: `Normalized ${leads.length} ${source} result${leads.length === 1 ? "" : "s"} and sent them to the Intelligence Bank for dedup + storage. Review in CRM before any outreach.`
    });
  } catch (error) {
    return NextResponse.json(
      {
        captured: 0,
        forwarded: leads.length,
        notice: "Normalized leads but could not reach the Intelligence Bank.",
        error: error instanceof Error ? error.message : "unknown error"
      },
      { status: 200 }
    );
  }
}
