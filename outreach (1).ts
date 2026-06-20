import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  keyword: z.string().trim().min(2),
  num: z.coerce.number().int().min(1).max(10).optional().default(10)
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid SERP request", issues: parsed.error.flatten() }, { status: 400 });

  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;
  const { keyword, num } = parsed.data;

  if (!apiKey || !cx) {
    return NextResponse.json({
      keyword,
      results: [],
      gaps: [
        "GOOGLE_SEARCH_API_KEY or GOOGLE_SEARCH_CX is missing.",
        "Use Google search and Google Trends links until Custom Search is configured."
      ],
      googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(keyword)}`,
      googleTrendsUrl: `https://trends.google.com/trends/explore?geo=US&q=${encodeURIComponent(keyword)}`
    });
  }

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("cx", cx);
  url.searchParams.set("q", keyword);
  url.searchParams.set("num", String(num));

  const response = await fetch(url, { next: { revalidate: 900 } });
  if (!response.ok) {
    const text = await response.text();
    return NextResponse.json({
      error: "Google Custom Search request failed",
      status: response.status,
      detail: text.slice(0, 1000),
      googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(keyword)}`
    }, { status: 502 });
  }
  const data = await response.json();
  const results = (data.items ?? []).map((item: any, index: number) => ({
    rank: index + 1,
    title: item.title ?? "Untitled",
    link: item.link ?? "#",
    snippet: item.snippet ?? "",
    displayLink: item.displayLink ?? ""
  }));

  const combined = results.map((r: any) => `${r.title} ${r.snippet}`.toLowerCase()).join(" ");
  const gaps = [
    !combined.includes("calculator") && "Add a lost-hours calculator CTA above the fold.",
    !combined.includes("emr") && "Clarify that Infinite Suite is an EMR overlay, not a replacement.",
    !combined.includes("cancellation") && "Add cancellation/callout recovery examples.",
    !combined.includes("faq") && "Add FAQ schema-style questions for long-tail search.",
    !combined.includes("authorization") && "Mention auth utilization and review readiness."
  ].filter(Boolean);

  return NextResponse.json({
    keyword,
    totalResults: data.searchInformation?.formattedTotalResults ?? data.searchInformation?.totalResults,
    results,
    gaps,
    googleSearchUrl: `https://www.google.com/search?q=${encodeURIComponent(keyword)}`,
    googleTrendsUrl: `https://trends.google.com/trends/explore?geo=US&q=${encodeURIComponent(keyword)}`
  });
}
