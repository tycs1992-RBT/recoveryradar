import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  businessType: z.string().trim().min(2).default("ABA clinic"),
  location: z.string().trim().min(2).default("Florida"),
  maxResults: z.coerce.number().int().min(1).max(200).default(50),
  extraQueries: z.array(z.string().trim().min(2)).optional().default([]),
  // When true, bias queries + scoring toward likely-NEW / just-opening clinics.
  findNewClinics: z.coerce.boolean().optional().default(false)
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
  // Inferred newness — NOT an exact opening date (Places does not expose one).
  newClinicLikelihood: "likely-new" | "possibly-new" | "established" | "unknown";
  notes: string;
};

function slug(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}

// Infer how likely a clinic is newly opened. Places gives no opening date, so we
// use review count as the proxy: brand-new businesses have few or zero reviews.
function inferNewClinicLikelihood(reviewCount?: number): LeadMachineLead["newClinicLikelihood"] {
  if (reviewCount === undefined || reviewCount === null) return "unknown";
  if (reviewCount <= 3) return "likely-new";
  if (reviewCount <= 12) return "possibly-new";
  return "established";
}

// Default scoring (established-clinic lead value): more reviews/rating = stronger.
function scoreLead(lead: Partial<LeadMachineLead>) {
  let score = 20;
  if (lead.website) score += 25;
  if (lead.phone) score += 20;
  if ((lead.reviewCount ?? 0) >= 20) score += 10;
  if ((lead.rating ?? 0) >= 4.2) score += 10;
  if ((lead.businessStatus ?? "").toUpperCase() === "OPERATIONAL") score += 5;
  return Math.min(100, score);
}

// New-clinic scoring: INVERT the review weighting — few reviews ranks higher,
// because that's the signal a clinic just opened and needs a stack. Contactability
// (website/phone) still matters so you can actually reach them.
function scoreNewClinicLead(lead: Partial<LeadMachineLead>) {
  let score = 25;
  const reviews = lead.reviewCount ?? 0;
  if (reviews <= 3) score += 35;
  else if (reviews <= 12) score += 20;
  else score += 0; // established — not the target here
  if (lead.phone) score += 20;
  if (lead.website) score += 15;
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

  const { businessType, location, maxResults, extraQueries, findNewClinics } = parsed.data;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || "";

  // New-clinic mode adds "opening" intent terms to the text queries. (Places has no
  // opened-date filter, so this just biases the text search; newness is confirmed by
  // the review-count proxy in scoring.)
  const newClinicQueries = findNewClinics
    ? [
        `new ${businessType} ${location}`,
        `${businessType} now open ${location}`,
        `${businessType} grand opening ${location}`
      ]
    : [];

  const baseQueries = [
    `${businessType} ${location}`,
    `${businessType} near ${location}`,
    ...newClinicQueries,
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
          newClinicLikelihood: inferNewClinicLikelihood(place.userRatingCount),
          notes: findNewClinics
            ? "Public Google Places listing. Newness inferred from review count (Places has no opening date). Open the website/socials and verify before outreach."
            : "Public Google Places business listing. Review before outreach."
        };
        lead.leadScore = findNewClinics ? scoreNewClinicLead(lead) : scoreLead(lead);
        leads.push(lead);
      }
    } catch (error) {
      errors.push({ query, message: error instanceof Error ? error.message : "Unknown Places API error" });
    }
  }

  const deduped = Array.from(
    new Map(leads.map((lead) => [`${lead.businessName}|${lead.address}|${lead.website}`, lead])).values()
  );

  // In new-clinic mode, surface the likeliest-new clinics first; otherwise highest lead score.
  const newnessRank: Record<string, number> = { "likely-new": 0, "possibly-new": 1, established: 2, unknown: 3 };
  const sorted = findNewClinics
    ? deduped.sort((a, b) => {
        const ra = newnessRank[a.newClinicLikelihood] ?? 3;
        const rb = newnessRank[b.newClinicLikelihood] ?? 3;
        if (ra !== rb) return ra - rb;
        return b.leadScore - a.leadScore;
      })
    : deduped.sort((a, b) => b.leadScore - a.leadScore);
  const finalLeads = sorted.slice(0, maxResults);
  const newClinicCount = finalLeads.filter((l) => l.newClinicLikelihood === "likely-new").length;

  return NextResponse.json({
    source: "google_places",
    mode: findNewClinics ? "new_clinic_finder" : "all_clinics",
    notice: findNewClinics
      ? `Google Places leads, ranked by likely-new first (${newClinicCount} flagged likely-new). Newness is inferred from review count, not an exact opening date — open each clinic's website/socials to confirm. Places does not provide emails; use Enrich Websites for public contact info. Review manually before outreach.`
      : "Google Places business leads returned. Review manually before outreach. Emails are not provided by Places; use Enrich Websites to find public business emails/contact forms.",
    leads: finalLeads,
    errors
  });
}
