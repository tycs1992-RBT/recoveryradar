import { NextResponse } from "next/server";
import { z } from "zod";
import { parseCsv, parseNumber } from "@/lib/seo-suite";

const schema = z.object({ csv: z.string().min(5) });

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid Search Console import", issues: parsed.error.flatten() }, { status: 400 });
  const rows = parseCsv(parsed.data.csv);
  const headers = rows[0]?.map((h) => h.toLowerCase().trim()) ?? [];
  const idx = (names: string[]) => headers.findIndex((h) => names.some((name) => h.includes(name)));
  const q = idx(["query", "keyword"]);
  const clicks = idx(["clicks"]);
  const impressions = idx(["impressions"]);
  const ctr = idx(["ctr"]);
  const position = idx(["position"]);
  const opportunities = rows.slice(1).map((row) => {
    const query = row[q] ?? "";
    const imps = parseNumber(row[impressions]) ?? 0;
    const pos = parseNumber(row[position]) ?? 99;
    const clickCount = parseNumber(row[clicks]) ?? 0;
    const opportunityScore = Math.round(Math.min(100, imps / 10 + Math.max(0, 20 - pos) * 3 - clickCount));
    return { query, clicks: clickCount, impressions: imps, ctr: row[ctr] ?? "", position: pos, opportunityScore };
  }).filter((row) => row.query).sort((a, b) => b.opportunityScore - a.opportunityScore);
  return NextResponse.json({ opportunities, notice: "Imported Search Console CSV. Prioritize high impressions with positions 5-20 and low CTR." });
}
