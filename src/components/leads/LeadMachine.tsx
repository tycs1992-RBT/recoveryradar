"use client";

import { useMemo, useState } from "react";
import { ScorePill } from "@/components/ui/ScorePill";
import { EditableNumberInput } from "@/components/ui/EditableNumberInput";

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

const leadExportHeaders = [
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
  "Lead Score"
];

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function htmlEscape(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function leadExportValues(lead: LeadRow) {
  return [
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
    lead.leadScore
  ];
}

function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadCsv(filename: string, rows: LeadRow[]) {
  const body = rows.map((lead) => leadExportValues(lead).map(csvEscape).join(","));
  const csv = [leadExportHeaders.map(csvEscape).join(","), ...body].join("\n");
  downloadBlob(filename, csv, "text/csv;charset=utf-8");
}

function toGoogleSheetsTsv(rows: LeadRow[]) {
  const body = rows.map((lead) => leadExportValues(lead).map((value) => String(value ?? "").replace(/\t/g, " ").replace(/\n/g, " ")).join("\t"));
  return [leadExportHeaders.join("\t"), ...body].join("\n");
}

function buildGoogleDocsReport(rows: LeadRow[]) {
  const generatedAt = new Date().toLocaleString();
  const rowsHtml = rows.map((lead) => {
    const values = leadExportValues(lead);
    return `<tr>${values.map((value) => `<td>${htmlEscape(value)}</td>`).join("")}</tr>`;
  }).join("\n");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Recovery Radar Lead Report</title>
  <style>
    body { font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5; padding: 32px; }
    h1 { font-size: 28px; margin-bottom: 4px; }
    .meta { color: #64748b; margin-bottom: 24px; }
    .note { background: #eff6ff; border: 1px solid #bfdbfe; padding: 14px; border-radius: 14px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; vertical-align: top; }
    th { background: #f8fafc; }
  </style>
</head>
<body>
  <h1>Recovery Radar Lead Report</h1>
  <p class="meta">Generated ${htmlEscape(generatedAt)} · ${rows.length} selected leads</p>
  <div class="note"><strong>Manual review required:</strong> Review every source before outreach. Use only public business-level information. Do not include PHI, private group content, or unverified personal details.</div>
  <table>
    <thead><tr>${leadExportHeaders.map((header) => `<th>${htmlEscape(header)}</th>`).join("")}</tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</body>
</html>`;
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
  const [controlsCollapsed, setControlsCollapsed] = useState(false);

  const selectedLeads = useMemo(() => leads.filter((lead) => lead.selected !== false), [leads]);

  function toggleLead(id: string) {
    setLeads((prev) => prev.map((lead) => lead.id === id ? { ...lead, selected: lead.selected === false } : lead));
  }

  async function copyForGoogleSheets() {
    if (!selectedLeads.length) return;
    try {
      await navigator.clipboard.writeText(toGoogleSheetsTsv(selectedLeads));
      setNotice("Copied selected leads as tab-separated rows ending at Lead Score. Open Google Sheets, click cell A1, and paste.");
    } catch {
      setNotice("Clipboard copy was blocked. Use the Google Sheets CSV export instead.");
    }
  }

  function exportGoogleDocsReport() {
    if (!selectedLeads.length) return;
    downloadBlob("recovery-radar-google-docs-lead-report.html", buildGoogleDocsReport(selectedLeads), "text/html;charset=utf-8");
    setNotice("Downloaded a Google Docs-ready HTML report ending at Lead Score. Upload it to Google Drive, then open with Google Docs.");
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
    <div className={`grid gap-6 ${controlsCollapsed ? "xl:grid-cols-[92px_minmax(0,1fr)]" : "xl:grid-cols-[0.85fr_1.15fr]"}`}>
      {controlsCollapsed ? (
        <section className="card h-fit p-3">
          <button
            type="button"
            onClick={() => setControlsCollapsed(false)}
            className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-white text-xl font-black text-slate-950 shadow-soft transition hover:bg-slate-50"
            aria-label="Expand lead machine controls"
            title="Expand lead machine controls"
          >
            ›
          </button>
          <div className="mt-4 flex flex-col items-center gap-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 [writing-mode:vertical-rl]">Lead Machine</p>
            <span className="rounded-full bg-slate-100 px-2 py-2 text-[10px] font-black text-slate-600 [writing-mode:vertical-rl]">{leads.length} leads</span>
          </div>
        </section>
      ) : (
        <section className="card h-fit">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Lead Machine</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">Business lead list builder</h2>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="badge">Sheets + Docs</span>
              <button
                type="button"
                onClick={() => setControlsCollapsed(true)}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-lg font-black text-slate-700 shadow-soft transition hover:bg-slate-50"
                aria-label="Minimize lead machine controls"
                title="Minimize lead machine controls"
              >
                ‹
              </button>
            </div>
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
              <EditableNumberInput className="input" min={1} max={200} value={maxResults} onChange={setMaxResults} />
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
            <button type="button" onClick={() => downloadCsv("recovery-radar-google-sheets-leads.csv", selectedLeads)} disabled={!selectedLeads.length} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              Export Sheets CSV
            </button>
            <button type="button" onClick={copyForGoogleSheets} disabled={!selectedLeads.length} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              Copy for Sheets
            </button>
            <button type="button" onClick={exportGoogleDocsReport} disabled={!selectedLeads.length} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              Docs report
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
      )}

      <section className="card min-w-0">
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
