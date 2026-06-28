import { requireWorkspace } from "@/lib/api-guard";
import { NextResponse } from "next/server";

// Live proxy to the public NPPES NPI registry (no API key needed). Returns ABA
// providers for a state, newest enumeration first, so you can reach clinics around
// the time they register — before competitors have. Runs on the server; NPPES is
// reachable in production.

type NppesAddress = { address_purpose?: string; city?: string; state?: string; postal_code?: string; telephone_number?: string };
type NppesTaxonomy = { desc?: string; primary?: boolean; code?: string };
type NppesResult = {
  number?: string;
  enumeration_type?: string;
  basic?: { organization_name?: string; first_name?: string; last_name?: string; enumeration_date?: string };
  addresses?: NppesAddress[];
  taxonomies?: NppesTaxonomy[];
};

export async function GET(request: Request) {
  const denied = await requireWorkspace();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const state = (searchParams.get("state") || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2);
  const taxonomy = (searchParams.get("taxonomy") || "Behavior Analyst").slice(0, 60);
  const type = searchParams.get("type") === "NPI-1" ? "NPI-1" : "NPI-2";
  if (state.length !== 2) return NextResponse.json({ providers: [], error: "A 2-letter state is required." }, { status: 400 });

  const api = new URL("https://npiregistry.cms.hhs.gov/api/");
  api.searchParams.set("version", "2.1");
  api.searchParams.set("enumeration_type", type);
  api.searchParams.set("taxonomy_description", taxonomy);
  api.searchParams.set("state", state);
  api.searchParams.set("limit", "200");

  try {
    const res = await fetch(api.toString(), { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(9000) });
    if (!res.ok) return NextResponse.json({ providers: [], error: `NPI registry returned ${res.status}.` }, { status: 502 });
    const data = (await res.json()) as { result_count?: number; results?: NppesResult[] };

    const providers = (data.results ?? []).map((r) => {
      const b = r.basic ?? {};
      const name = b.organization_name?.trim() || [b.last_name, b.first_name].filter(Boolean).join(", ") || "Unknown";
      const loc = (r.addresses ?? []).find((a) => a.address_purpose === "LOCATION") ?? (r.addresses ?? [])[0] ?? {};
      const tax = (r.taxonomies ?? []).find((t) => t.primary) ?? (r.taxonomies ?? [])[0] ?? {};
      return {
        npi: r.number ?? "",
        name,
        type: r.enumeration_type === "NPI-2" ? "Organization" : "Individual",
        city: loc.city ?? "",
        state: loc.state ?? state,
        postal: (loc.postal_code ?? "").slice(0, 5),
        phone: loc.telephone_number ?? "",
        taxonomy: tax.desc ?? taxonomy,
        enumerationDate: b.enumeration_date ?? ""
      };
    });
    providers.sort((a, b) => (b.enumerationDate || "").localeCompare(a.enumerationDate || ""));

    return NextResponse.json({ providers, resultCount: data.result_count ?? providers.length });
  } catch {
    return NextResponse.json({ providers: [], error: "Could not reach the NPI registry. Try again in a moment." }, { status: 502 });
  }
}
