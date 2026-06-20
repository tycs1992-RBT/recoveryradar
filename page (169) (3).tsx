import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { keywordGroups } from "@/lib/constants";

type SearchItem = {
  title?: string;
  link?: string;
  snippet?: string;
};

function inferSignal(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("opening") || lower.includes("new clinic") || lower.includes("opening soon") || lower.includes("expands")) return "new_clinic";
  if (lower.includes("scheduler") || lower.includes("intake coordinator") || lower.includes("operations manager")) return "hiring_scheduler";
  if (lower.includes("bcba") || lower.includes("rbt")) return "hiring_bcba";
  if (lower.includes("centralreach") || lower.includes("rethink") || lower.includes("motivity") || lower.includes("software implementation") || lower.includes("emr migration")) return "emr_shopping";
  if (lower.includes("cancellation") || lower.includes("callout") || lower.includes("staffing") || lower.includes("billing") || lower.includes("scheduling")) return "operations_pain";
  return "public_interest_signal";
}

function guessCompany(title: string) {
  if (!title) return "";
  return title
    .split(/[-–:|]/)[0]
    .replace(/\b(New ABA clinic|Press Release|Article|Blog|ABA)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function getKeywords(groupName: string) {
  if (process.env.DATABASE_URL) {
    try {
      const group = await prisma.keywordGroup.findUnique({ where: { groupName } });
      if (group?.keywords.length) return group.keywords;
    } catch (error) {
      console.error(error);
    }
  }

  const staticGroup = keywordGroups.find((group) => group.groupName === groupName);
  return staticGroup ? [...staticGroup.keywords] : [];
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const groupName = String(body?.groupName ?? "").trim();
  const location = String(body?.location ?? "").trim();
  const maxResults = Math.min(Math.max(Number(body?.maxResults) || 5, 1), 10);

  if (!groupName) {
    return NextResponse.json({ error: "groupName is required" }, { status: 400 });
  }

  const keywords = await getKeywords(groupName);
  if (!keywords.length) {
    return NextResponse.json({ error: `Keyword group '${groupName}' not found` }, { status: 404 });
  }

  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;

  const results: Array<{
    keyword: string;
    query: string;
    title: string;
    link: string;
    snippet: string;
    suggestedSignal: string;
    inferredCompany: string;
    nextStep: string;
  }> = [];

  if (!apiKey || !cx) {
    for (const keyword of keywords) {
      const query = `${keyword} ${location}`.trim();
      results.push({
        keyword,
        query,
        title: `Mock public result for “${query}”`,
        link: "https://example.com/mock-public-result",
        snippet: "Configure GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_CX to run public-source discovery. This mock result is safe for testing.",
        suggestedSignal: "manual_review_required",
        inferredCompany: "",
        nextStep: "Review source manually before creating a lead."
      });
    }

    return NextResponse.json({
      queryGroup: groupName,
      results,
      notice: "Search keys are not configured. Mock public-result previews returned. No external search was performed."
    });
  }

  for (const keyword of keywords) {
    const query = `${keyword} ${location}`.trim();
    const url = new URL("https://www.googleapis.com/customsearch/v1");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("cx", cx);
    url.searchParams.set("q", query);
    url.searchParams.set("num", String(maxResults));

    try {
      const response = await fetch(url, { next: { revalidate: 3600 } });
      if (!response.ok) {
        results.push({
          keyword,
          query,
          title: `Search failed for “${query}”`,
          link: "#",
          snippet: "Google Custom Search request failed.",
          suggestedSignal: "manual_review_required",
          inferredCompany: "",
          nextStep: "Check API quota or credentials."
        });
        continue;
      }

      const data = (await response.json()) as { items?: SearchItem[] };
      for (const item of data.items ?? []) {
        const title = item.title ?? "Untitled public result";
        const snippet = item.snippet ?? "";
        results.push({
          keyword,
          query,
          title,
          link: item.link ?? "#",
          snippet,
          suggestedSignal: inferSignal(`${title} ${snippet}`),
          inferredCompany: guessCompany(title),
          nextStep: "Open source URL, verify ABA relevance, record only public business contact information, then add to CRM manually."
        });
      }
    } catch (error) {
      results.push({
        keyword,
        query,
        title: `Error searching for “${query}”`,
        link: "#",
        snippet: error instanceof Error ? error.message : "Unknown search error",
        suggestedSignal: "manual_review_required",
        inferredCompany: "",
        nextStep: "Retry or investigate search configuration."
      });
    }
  }

  return NextResponse.json({
    queryGroup: groupName,
    results,
    notice: "Public search results returned through Google Custom Search. Review sources manually before adding leads."
  });
}
