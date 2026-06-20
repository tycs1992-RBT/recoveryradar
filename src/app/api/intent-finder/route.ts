import { NextResponse } from "next/server";
import { z } from "zod";

const intentFinderSchema = z.object({
  keyword: z.string().min(2),
  location: z.string().optional().default("")
});

type SearchPreview = {
  title: string;
  link: string;
  snippet: string;
  suggestedSignal: string;
};

function inferSignal(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("opening") || lower.includes("new clinic") || lower.includes("expands")) return "new_clinic";
  if (lower.includes("scheduler") || lower.includes("intake coordinator")) return "hiring_scheduler";
  if (lower.includes("bcba") || lower.includes("rbt")) return "hiring_bcba";
  if (lower.includes("centralreach") || lower.includes("rethinking") || lower.includes("software")) return "emr_shopping";
  if (lower.includes("cancellation") || lower.includes("callout") || lower.includes("staffing")) return "operations_pain";
  return "public_interest_signal";
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = intentFinderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const query = `${parsed.data.keyword} ${parsed.data.location}`.trim();
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;

  if (!apiKey || !cx) {
    const mock: SearchPreview[] = [
      {
        title: `Public result preview for “${query}”`,
        link: "https://example.com/public-result",
        snippet:
          "Mock preview: New ABA clinic opening and hiring BCBAs, RBTs and scheduling support. Configure Google Custom Search to replace this with live public results.",
        suggestedSignal: "new_clinic"
      },
      {
        title: "Manual review queue",
        link: "https://example.com/manual-review",
        snippet:
          "Use this module to review source pages, confirm ABA relevance, and record only public company-level data or public business contact methods.",
        suggestedSignal: "manual_review_required"
      }
    ];

    return NextResponse.json({
      query,
      results: mock,
      notice:
        "Google Custom Search keys are not configured. This is a safe mock preview; no external search was performed."
    });
  }

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("cx", cx);
  url.searchParams.set("q", query);
  url.searchParams.set("num", "5");

  const response = await fetch(url, { next: { revalidate: 3600 } });

  if (!response.ok) {
    return NextResponse.json({ error: "Google Custom Search request failed" }, { status: 502 });
  }

  const data = await response.json();
  const results: SearchPreview[] = (data.items ?? []).map((item: { title?: string; link?: string; snippet?: string }) => ({
    title: item.title ?? "Untitled public result",
    link: item.link ?? "#",
    snippet: item.snippet ?? "",
    suggestedSignal: inferSignal(`${item.title ?? ""} ${item.snippet ?? ""}`)
  }));

  return NextResponse.json({
    query,
    results,
    notice: "Public search results returned through Google Custom Search. Review sources manually before adding leads."
  });
}
