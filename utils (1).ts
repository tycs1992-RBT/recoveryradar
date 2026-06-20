import { NextResponse } from "next/server";
import { z } from "zod";

const leadSchema = z.object({
  id: z.string(),
  businessName: z.string(),
  website: z.string().optional().default("")
});

const requestSchema = z.object({
  leads: z.array(leadSchema).max(50)
});

const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const badExtensions = /\.(png|jpg|jpeg|gif|webp|svg|css|js)$/i;

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function normalizeUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(7000),
    headers: {
      "user-agent": "RecoveryRadarLeadMachine/1.0 (+https://demo.infinitepieces.ai)"
    }
  });
  if (!response.ok) return "";
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html") && !contentType.includes("text/plain")) return "";
  return response.text();
}

function findContactLinks(baseUrl: string, html: string) {
  const urls = new Set<string>();
  const origin = new URL(baseUrl).origin;
  const hrefRegex = /href=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = hrefRegex.exec(html))) {
    const href = match[1];
    if (/contact|about|team|staff|get-in-touch|locations/i.test(href)) {
      try {
        urls.add(new URL(href, origin).toString());
      } catch {
        // ignore malformed urls
      }
    }
  }
  ["/contact", "/contact-us", "/about", "/team", "/locations"].forEach((path) => urls.add(`${origin}${path}`));
  return Array.from(urls).slice(0, 6);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid enrichment request", issues: parsed.error.flatten() }, { status: 400 });
  }

  const enriched = [];

  for (const lead of parsed.data.leads) {
    const website = normalizeUrl(lead.website);
    if (!website) {
      enriched.push({ id: lead.id, publicEmails: [], contactFormUrl: "", enrichmentNotes: "No website available." });
      continue;
    }

    try {
      const homepage = await fetchText(website);
      const candidates = [website, ...findContactLinks(website, homepage)];
      const emails: string[] = [];
      let contactFormUrl = "";

      for (const candidate of candidates) {
        const html = candidate === website ? homepage : await fetchText(candidate);
        const found = html.match(emailRegex) ?? [];
        emails.push(...found.filter((email) => !badExtensions.test(email)).map((email) => email.toLowerCase()));
        if (!contactFormUrl && /<form[\s>]/i.test(html)) {
          contactFormUrl = candidate;
        }
      }

      enriched.push({
        id: lead.id,
        publicEmails: unique(emails).slice(0, 5),
        contactFormUrl,
        enrichmentNotes: unique(emails).length
          ? "Public business email found on website/contact pages. Review before outreach."
          : contactFormUrl
            ? "No public email found; contact form found."
            : "No public email/contact form found in lightweight website check."
      });
    } catch (error) {
      enriched.push({
        id: lead.id,
        publicEmails: [],
        contactFormUrl: "",
        enrichmentNotes: error instanceof Error ? `Enrichment failed: ${error.message}` : "Enrichment failed."
      });
    }
  }

  return NextResponse.json({ enriched });
}
