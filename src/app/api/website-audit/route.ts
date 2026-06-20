import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  url: z.string().url(),
  targetKeyword: z.string().trim().optional().default("ABA operational recovery")
});

function extract(pattern: RegExp, html: string) {
  const match = html.match(pattern);
  return match?.[1]?.replace(/\s+/g, " ").trim() ?? "";
}

function all(pattern: RegExp, html: string) {
  return Array.from(html.matchAll(pattern)).map((m) => m[1]?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()).filter(Boolean);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid audit request", issues: parsed.error.flatten() }, { status: 400 });

  const { url, targetKeyword } = parsed.data;
  try {
    const response = await fetch(url, { headers: { "User-Agent": "RecoveryRadarAudit/1.0" }, next: { revalidate: 900 } });
    const html = await response.text();
    const title = extract(/<title[^>]*>([\s\S]*?)<\/title>/i, html);
    const metaDescription = extract(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i, html) || extract(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i, html);
    const h1s = all(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, html);
    const h2s = all(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, html);
    const lower = html.toLowerCase();
    const keywordLower = targetKeyword.toLowerCase();
    const checks = [
      { label: "Target keyword appears in title", passed: title.toLowerCase().includes(keywordLower.split(" ")[0]) || title.toLowerCase().includes(keywordLower) },
      { label: "Meta description exists", passed: Boolean(metaDescription) },
      { label: "At least one H1 exists", passed: h1s.length > 0 },
      { label: "Lost-hours calculator CTA present", passed: lower.includes("calculator") || lower.includes("lost hours") },
      { label: "Provider Portal CTA present", passed: lower.includes("provider portal") },
      { label: "No-migration positioning present", passed: lower.includes("keep your current emr") || lower.includes("no-migration") },
      { label: "FAQ/search intent section likely present", passed: lower.includes("faq") || lower.includes("questions") }
    ];
    const recommendations = checks.filter((check) => !check.passed).map((check) => `Fix: ${check.label}`);
    return NextResponse.json({
      url,
      status: response.status,
      title,
      metaDescription,
      h1s,
      h2s: h2s.slice(0, 12),
      checks,
      score: Math.round((checks.filter((check) => check.passed).length / checks.length) * 100),
      recommendations
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Website audit failed" }, { status: 502 });
  }
}
