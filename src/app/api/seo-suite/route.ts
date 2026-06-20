import { NextResponse } from "next/server";
import { z } from "zod";
import { buildKeywordAnalysis, generateSeedRows, parseKeywordPlannerCsv, type KeywordPlannerRow } from "@/lib/seo-suite";

const schema = z.object({
  niche: z.string().trim().optional().default("ABA clinic software"),
  locations: z.array(z.string()).optional().default([]),
  csv: z.string().optional().default(""),
  rows: z.array(z.object({
    keyword: z.string(),
    avgMonthlySearches: z.number().nullable().optional(),
    competition: z.string().nullable().optional(),
    competitionIndex: z.number().nullable().optional(),
    lowTopOfPageBid: z.number().nullable().optional(),
    highTopOfPageBid: z.number().nullable().optional(),
    source: z.string().nullable().optional()
  })).optional().default([])
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid SEO suite request", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { niche, locations, csv, rows } = parsed.data;
  const csvRows = csv ? parseKeywordPlannerCsv(csv) : [];
  const inputRows: KeywordPlannerRow[] = rows.length ? rows : csvRows.length ? csvRows : generateSeedRows(niche, locations);
  const analysis = buildKeywordAnalysis(inputRows);

  return NextResponse.json({
    notice: rows.length || csvRows.length
      ? "Keyword Planner data imported and prioritized. Use priority score to decide landing pages, ads, and outreach angles."
      : "Seed keyword analysis generated. Import Google Keyword Planner CSV later for true volume and bid data.",
    ...analysis
  });
}
