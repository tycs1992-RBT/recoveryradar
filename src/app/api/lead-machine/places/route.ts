import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  businessType: z.string().trim().min(2).default("ABA clinic"),
  location: z.string().trim().min(2).default("Florida"),
  maxResults: z.coerce.number().int().min(1).max(200).default(50),
  extraQueries: z.array(z.string().trim().min(2)).optional().default([])
});

type LeadMachineLead = {
  id: string;
  businessName: string;
  website?: string;
  phone?: string;
  address?: string;
  cityState?: string;
  googleMapsUrl?: string;
  rating?: number;
  reviewCount?: number;
  businessStatus?: string;
  sourceQuery: string;
  leadScore: number;
  notes: string;
};

function slug(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}

function scoreLead(lead: Partial<LeadMachineLead>) {
  let score = 20;
  if (lead.website) score += 25;
  if (lead.phone) score += 20;
  if ((lead.reviewCount ?? 0) >= 20) score += 10;
  if ((lead.rating ?? 0) >= 4.2) score += 10;
  if ((lead.businessStatus ?? "").toUpperCase() === "OPERATIONAL") score += 5;
  return Math.min(100, score);
}

function cityStateFromAddress(address?: string) {
  if (!address) return "";
  const parts = address.split(",").map((part) => part.trim());
  if (parts.length >= 3) return `${parts[parts.length - 3]}, ${parts[parts.length - 2]}`;
  return parts.slice(-2).join(", ");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid lead machine request", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { businessType, location, maxResults, extraQueries } = parsed.data;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || "";

  const baseQueries = [
    `${businessType} ${location}`,
    `${businessType} near ${location}`,
    ...extraQueries.map((query) => query.includes(location) ? query : `${query} ${location}`)
  ];
  const queries = Array.from(new Set(baseQueries)).slice(0, 8);

  if (!apiKey) {
    return NextResponse.json({
      source: "not_configured",
      notice: "GOOGLE_PLACES_API_KEY is not configured in this environment. No sample leads are returned in production clean-slate mode.",
      leads: [],
      errors: [{ query: `${businessType} ${location}`, message: "Missing GOOGLE_PLACES_API_KEY" }]
    }, { status: 200 });
  }

  const fieldMask = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.nationalPhoneNumber",
    "places.internationalPhoneNumber",
    "places.websiteUri",
    "places.googleMapsUri",
    "places.rating",
    "places.userRatingCount",
    "places.businessStatus"
  ].join(",");

  const leads: LeadMachineLead[] = [];
  const errors: Array<{ query: string; status?: number; message: string }> = [];

  for (const query of queries) {
    if (leads.length >= maxResults) break;

    try {
      const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": fieldMask
        },
        body: JSON.stringify({
          textQuery: query,
          maxResultCount: Math.min(20, Math.max(1, maxResults - leads.length))
        })
      });

      if (!response.ok) {
        const text = await response.text();
        errors.push({ query, status: response.status, message: text.slice(0, 500) });
        continue;
      }

      const data = await response.json();
      const places = Array.isArray(data.places) ? data.places : [];
      for (const place of places) {
        const businessName = place.displayName?.text ?? "Unknown business";
        const website = place.websiteUri ?? "";
        const phone = place.nationalPhoneNumber ?? place.internationalPhoneNumber ?? "";
        const address = place.formattedAddress ?? "";
        const lead: LeadMachineLead = {
          id: place.id ?? `${slug(businessName)}-${slug(address)}`,
          businessName,
          website,
          phone,
          address,
          cityState: cityStateFromAddress(address),
          googleMapsUrl: place.googleMapsUri,
          rating: place.rating,
          reviewCount: place.userRatingCount,
          businessStatus: place.businessStatus,
          sourceQuery: query,
          leadScore: 0,
          notes: "Public Google Places business listing. Review before outreach."
        };
        lead.leadScore = scoreLead(lead);
        leads.push(lead);
      }
    } catch (error) {
      errors.push({ query, message: error instanceof Error ? error.message : "Unknown Places API error" });
    }
  }

  const deduped = Array.from(
    new Map(leads.map((lead) => [`${lead.businessName}|${lead.address}|${lead.website}`, lead])).values()
  ).slice(0, maxResults);

  return NextResponse.json({
    source: "google_places",
    notice: "Google Places business leads returned. Review manually before outreach. Emails are not provided by Places; use Enrich Websites to find public business emails/contact forms.",
    leads: deduped,
    errors
  });
}
