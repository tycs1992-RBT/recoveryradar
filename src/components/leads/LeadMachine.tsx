"use client";

import { useMemo, useState } from "react";
import { ScorePill } from "@/components/ui/ScorePill";

type LeadRow = {
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
  publicEmails?: string[];
  contactFormUrl?: string;
  enrichmentNotes?: string;
  selected?: boolean;
};

type EnrichedLeadRow = Pick<LeadRow, "id"> & Partial<LeadRow>;

type EnrichmentResponse = {
  enriched?: EnrichedLeadRow[];
  error?: string;
};

type LeadSearchResponse = {
  leads?: LeadRow[];
  notice?: string;
  errors?: Array<{ query: string; status?: number; message: string }>;
  error?: string;
};

type HubSpotSyncResponse = {
  results?: Record<string, unknown>;
  error?: string;
};

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function downloadCsv(filename: string, rows: LeadRow[]) {
  const headers = [
    "Business Name",
    "Phone",
    "Website",
    "Public Emails",
    "Contact Form URL",
    "Address",
    "City/State",
    "Google Maps URL",
    "Rating",
    "Review Count",
    "Lead Score",
    "Source Query",
    "Notes"
  ];
  const body = rows.map((lead) => [
    lead.businessName,
    lead.phone,
    lead.website,
    lead.publicEmails?.join("; "),
    lead.contactFormUrl,
    lead.address,
    lead.cityState,
    lead.googleMapsUrl,
    lead.rating,
    lead.reviewCount,
    lead.leadScore,
    lead.sourceQuery,
    `${lead.notes ?? ""} ${lead.enrichmentNotes ?? ""}`.trim()
  ].map(csvEscape).join(","));
  const csv = [headers.map(csvEscape).join(","), ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function LeadMachine() {
  const [businessType, setBusinessType] = useState("ABA clinic");
  const [location, setLocation] = useState("Florida");
  const [maxResults, setMaxResults] = useState(50);
  const [extraQueriesText, setExtraQueriesText] = useState("ABA therapy center\nautism therapy clinic\nbehavior analyst clinic");
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [notice, setNotice] = useState("Search Google Places for public business leads. Review before outreach.");
  const [errors, setErrors] = useState<Array<{ query: string; status?: number; message: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [enriching, setEnriching] = useState(false);

  const selectedLeads = useMemo(() => leads.filter((lead) => lead.selected !== false), [leads]);

  function toggleLead(id: string) {
    setLeads((prev) => prev.map((lead) => lead.id === id ? { ...lead, selected: lead.selected === false } : lead));
  }

  async function findBusinesses() {
    setLoading(true);
    setErrors([]);
    setNotice("Searching public business listings...");
    try {
      const response = await fetch("/api/lead-machine/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType,
          location,
          maxResults,
          extraQueries: extraQueriesText.split("\n").map((line) => line.trim()).filter(Boolean)
        })
      });
      const data = (await response.json()) as LeadSearchResponse;
      if (!response.ok) throw new Error(data.error ?? "Lead search failed");
      setLeads((data.leads ?? []).map((lead) => ({ ...lead, selected: true })));
      setNotice(data.notice ?? "Leads returned. Review before outreach.");
      setErrors(data.errors ?? []);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Lead search failed");
    } finally {
      setLoading(false);
    }
  }

  async function enrichWebsites() {
    const withWebsites = selectedLeads.filter((lead) => lead.website).slice(0, 50);
    if (!withWebsites.length) {
      setNotice("No selected leads have websites to enrich.");
      return;
    }
    setEnriching(true);
    setNotice("Checking public website contact/about pages for business emails and forms...");
    try {
      const response = await fetch("/api/lead-machine/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: withWebsites })
      });
      const data = (await response.json()) as EnrichmentResponse;
      if (!response.ok) throw new Error(data.error ?? "Website enrichment failed");
      const lookup = new Map<string, EnrichedLeadRow>((data.enriched ?? []).map((item) => [item.id, item]));
      setLeads((prev) =>
        prev.map((lead) => {
          const enriched = lookup.get(lead.id);
          return enriched ? { ...lead, ...enriched } : lead;
        })
      );
      setNotice("Website enrichment complete. Review emails/contact forms before outreach.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Website enrichment failed");
    } finally {
      setEnriching(false);
    }
  }

  async function sendToHubSpot(lead: LeadRow) {
    setNotice(`Sending ${lead.businessName} to HubSpot...`);
    try {
      const response = await fetch("/api/hubspot/sync-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead)
      });
      const data = (await response.json()) as HubSpotSyncResponse;
      if (!response.ok) throw new Error(data.error ?? "HubSpot sync failed");
      const warnings = Object.entries(data.results ?? {})
        .filter(([key]) => key.toLowerCase().includes("error"))
        .map(([key, value]) => `${key}: ${String(value)}`);
      setNotice(warnings.length ? `HubSpot partial sync complete for ${lead.businessName}. ${warnings.join(" | ")}` : `HubSpot sync complete for ${lead.businessName}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "HubSpot sync failed");
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <section className="card h-fit">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Lead Machine</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Business lead list builder</h2>
          </div>
          <span className="badge">CSV first</span>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Built for the 50-200 lead spreadsheet workflow: search a category and location, collect public business names, phones, websites, addresses, then enrich public website emails/contact forms.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="label">Business category / search</span>
            <input className="input" value={businessType} onChange={(event) => setBusinessType(event.target.value)} />
          </label>
          <label className="block space-y-2">
            <span className="label">Location</span>
            <input className="input" value={location} onChange={(event) => setLocation(event.target.value)} />
          </label>
          <label className="block space-y-2">
            <span className="label">Max results</span>
            <input className="input" type="number" min={1} max={200} value={maxResults} onChange={(event) => setMaxResults(Number(event.target.value))} />
          </label>
          <label className="block space-y-2">
            <span className="label">Extra search phrases, one per line</span>
            <textarea className="input min-h-32" value={extraQueriesText} onChange={(event) => setExtraQueriesText(event.target.value)} />
          </label>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={findBusinesses} disabled={loading} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-60">
            {loading ? "Finding..." : "Find businesses"}
          </button>
          <button type="button" onClick={enrichWebsites} disabled={enriching || !leads.length} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60">
            {enriching ? "Enriching..." : "Enrich websites"}
          </button>
          <button type="button" onClick={() => downloadCsv("recovery-radar-leads.csv", selectedLeads)} disabled={!selectedLeads.length} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60">
            Export selected CSV
          </button>
          <button type="button" onClick={() => setLeads((prev) => prev.map((lead) => ({ ...lead, selected: true })))} disabled={!leads.length} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60">
            Select all
          </button>
        </div>

        <div className="mt-6 rounded-3xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">{notice}</div>
        {errors.length > 0 && (
          <div className="mt-4 rounded-3xl bg-amber-50 p-4 text-xs leading-5 text-amber-900">
            <p className="font-black">API notes</p>
            {errors.slice(0, 3).map((error) => <p key={`${error.query}-${error.status}`}>{error.query}: {error.status ?? "error"} {error.message}</p>)}
          </div>
        )}
      </section>

      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Results</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">{leads.length} leads found</h2>
          </div>
          <span className="badge">{selectedLeads.length} selected</span>
        </div>

        <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200">
          <table className="min-w-[1200px] w-full divide-y divide-slate-200 bg-white text-sm">
            <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Use</th>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email / form</th>
                <th className="px-4 py-3">Website</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-4 py-4 align-top"><input type="checkbox" checked={lead.selected !== false} onChange={() => toggleLead(lead.id)} /></td>
                  <td className="px-4 py-4 align-top">
                    <p className="font-black text-slate-950">{lead.businessName}</p>
                    <p className="mt-1 text-xs text-slate-500">{lead.address}</p>
                    <p className="mt-1 text-xs text-slate-400">Query: {lead.sourceQuery}</p>
                  </td>
                  <td className="px-4 py-4 align-top font-semibold text-slate-700">{lead.phone || "—"}</td>
                  <td className="px-4 py-4 align-top">
                    {lead.publicEmails?.length ? (
                      <div className="space-y-1">{lead.publicEmails.map((email) => <p key={email} className="font-semibold text-slate-700">{email}</p>)}</div>
                    ) : lead.contactFormUrl ? (
                      <a href={lead.contactFormUrl} target="_blank" rel="noreferrer" className="font-bold underline">Contact form</a>
                    ) : <span className="text-slate-400">Run enrichment</span>}
                    {lead.enrichmentNotes && <p className="mt-1 max-w-xs text-xs text-slate-500">{lead.enrichmentNotes}</p>}
                  </td>
                  <td className="px-4 py-4 align-top">
                    {lead.website ? <a href={lead.website} target="_blank" rel="noreferrer" className="font-bold underline">Website</a> : "—"}
                    {lead.googleMapsUrl && <a href={lead.googleMapsUrl} target="_blank" rel="noreferrer" className="ml-3 font-bold underline">Maps</a>}
                    <p className="mt-1 text-xs text-slate-500">{lead.rating ? `${lead.rating} stars` : "No rating"} {lead.reviewCount ? `(${lead.reviewCount})` : ""}</p>
                  </td>
                  <td className="px-4 py-4 align-top"><ScorePill score={lead.leadScore} /></td>
                  <td className="px-4 py-4 align-top">
                    <button type="button" onClick={() => sendToHubSpot(lead)} className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white">Send to HubSpot</button>
                  </td>
                </tr>
              ))}
              {!leads.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-slate-500">Search to build a lead spreadsheet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
