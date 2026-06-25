"use client";

import { useMemo, useState } from "react";
import { EditableNumberInput } from "@/components/ui/EditableNumberInput";
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
  sourceQuery: string;
  leadScore: number;
  notes: string;
  publicEmails?: string[];
  contactFormUrl?: string;
  enrichmentNotes?: string;
  selected?: boolean;
};

type LeadSearchResponse = {
  leads?: LeadRow[];
  notice?: string;
  errors?: Array<{ query: string; status?: number; message: string }>;
  error?: string;
};

type EnrichmentResponse = {
  enriched?: Array<Pick<LeadRow, "id"> & Partial<LeadRow>>;
  error?: string;
};

function clean(value: unknown) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function cleanUrl(value: unknown) {
  try {
    const raw = String(value ?? "").trim();
    if (!raw) return "";
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    return url.hostname.replace(/^www\./, "").toLowerCase() + url.pathname.replace(/\/$/, "");
  } catch {
    return clean(value);
  }
}

function leadKey(lead: LeadRow) {
  const site = cleanUrl(lead.website);
  if (site) return `site:${site}`;
  if (lead.publicEmails?.[0]) return `email:${clean(lead.publicEmails[0])}`;
  return `business:${clean(lead.businessName)}:${clean(lead.address)}`;
}

function alphabetizeAndDedupe(rows: LeadRow[]) {
  const map = new Map<string, LeadRow>();
  for (const row of rows) {
    const key = leadKey(row);
    const existing = map.get(key);
    if (!existing || row.leadScore > existing.leadScore) map.set(key, row);
  }
  return Array.from(map.values()).sort((a, b) => clean(a.businessName).localeCompare(clean(b.businessName)));
}

const exportHeaders = ["Business Name", "Phone", "Website", "Public Emails", "Contact Form URL", "Address", "City/State", "Google Maps URL", "Rating", "Review Count", "Lead Score"];

function exportValues(lead: LeadRow) {
  return [lead.businessName, lead.phone, lead.website, lead.publicEmails?.join("; "), lead.contactFormUrl, lead.address, lead.cityState, lead.googleMapsUrl, lead.rating, lead.reviewCount, lead.leadScore];
}

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function downloadCsv(rows: LeadRow[]) {
  const csv = [exportHeaders.map(csvEscape).join(","), ...rows.map((lead) => exportValues(lead).map(csvEscape).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "recovery-radar-leads-alphabetized.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function toSheets(rows: LeadRow[]) {
  return [exportHeaders.join("\t"), ...rows.map((lead) => exportValues(lead).map((value) => String(value ?? "").replace(/\t/g, " ").replace(/\n/g, " ")).join("\t"))].join("\n");
}

export function LeadMachinePro() {
  const [businessType, setBusinessType] = useState("ABA clinic");
  const [location, setLocation] = useState("Florida");
  const [maxResults, setMaxResults] = useState(50);
  const [extraQueriesText, setExtraQueriesText] = useState("ABA therapy center\nautism therapy clinic\nbehavior analyst clinic");
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [notice, setNotice] = useState("All results are alphabetized and deduped by business name, website, email, and address before export or bank save.");
  const [loading, setLoading] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [banking, setBanking] = useState(false);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);

  const selectedLeads = useMemo(() => alphabetizeAndDedupe(leads.filter((lead) => lead.selected !== false)), [leads]);
  const visibleLeads = useMemo(() => alphabetizeAndDedupe(leads), [leads]);

  function toggleLead(id: string) {
    setLeads((prev) => alphabetizeAndDedupe(prev.map((lead) => lead.id === id ? { ...lead, selected: lead.selected === false } : lead)));
  }

  async function findBusinesses() {
    setLoading(true);
    setNotice("Searching public business listings...");
    try {
      const response = await fetch("/api/lead-machine/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessType, location, maxResults, extraQueries: extraQueriesText.split("\n").map((line) => line.trim()).filter(Boolean) })
      });
      const data = (await response.json()) as LeadSearchResponse;
      if (!response.ok) throw new Error(data.error ?? "Lead search failed");
      setLeads(alphabetizeAndDedupe((data.leads ?? []).map((lead) => ({ ...lead, selected: true }))));
      setNotice(data.notice ?? "Leads returned, alphabetized, and duplicate-checked.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Lead search failed");
    } finally {
      setLoading(false);
    }
  }

  async function enrichWebsites() {
    const withWebsites = selectedLeads.filter((lead) => lead.website).slice(0, 50);
    if (!withWebsites.length) return setNotice("No selected leads have websites to enrich.");
    setEnriching(true);
    setNotice("Checking public website contact pages...");
    try {
      const response = await fetch("/api/lead-machine/enrich", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leads: withWebsites }) });
      const data = (await response.json()) as EnrichmentResponse;
      if (!response.ok) throw new Error(data.error ?? "Website enrichment failed");
      const lookup = new Map((data.enriched ?? []).map((item) => [item.id, item]));
      setLeads((prev) => alphabetizeAndDedupe(prev.map((lead) => ({ ...lead, ...(lookup.get(lead.id) ?? {}) }))));
      setNotice("Website enrichment complete. Results stayed alphabetized and deduped.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Website enrichment failed");
    } finally {
      setEnriching(false);
    }
  }

  async function copyForSheets() {
    await navigator.clipboard.writeText(toSheets(selectedLeads));
    setNotice("Copied alphabetized selected leads for Google Sheets. Open Sheets, click A1, and paste.");
  }

  async function saveToBank() {
    if (!selectedLeads.length) return;
    setBanking(true);
    setNotice("Saving selected leads to Intelligence Bank with duplicate checks...");
    try {
      const response = await fetch("/api/intelligence-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: selectedLeads.map((lead) => ({
            recordType: "COMPANY",
            name: lead.businessName,
            companyName: lead.businessName,
            website: lead.website,
            sourceUrl: lead.googleMapsUrl,
            publicEmail: lead.publicEmails?.[0],
            phone: lead.phone,
            address: lead.address,
            cityState: lead.cityState,
            leadScore: lead.leadScore,
            sourceQuery: lead.sourceQuery,
            sourceTool: "Lead Machine",
            notes: lead.notes
          }))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Bank save failed");
      setNotice(`${data.saved ?? selectedLeads.length} selected leads saved to Intelligence Bank. Duplicates were skipped or updated.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Bank save failed");
    } finally {
      setBanking(false);
    }
  }

  return (
    <div className={`grid gap-6 ${controlsCollapsed ? "xl:grid-cols-[92px_minmax(0,1fr)]" : "xl:grid-cols-[0.85fr_1.15fr]"}`}>
      {controlsCollapsed ? (
        <section className="card h-fit p-3">
          <button type="button" onClick={() => setControlsCollapsed(false)} className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-white text-xl font-black text-slate-950 shadow-soft">›</button>
          <div className="mt-4 flex flex-col items-center gap-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 [writing-mode:vertical-rl]">Lead Machine</p>
            <span className="rounded-full bg-slate-100 px-2 py-2 text-[10px] font-black text-slate-600 [writing-mode:vertical-rl]">{visibleLeads.length} leads</span>
          </div>
        </section>
      ) : (
        <section className="card h-fit">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Lead Machine</p><h2 className="mt-2 text-3xl font-black text-slate-950">Business lead list builder</h2></div>
            <div className="flex shrink-0 items-center gap-2"><span className="badge">A-Z + dedupe</span><button type="button" onClick={() => setControlsCollapsed(true)} className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-lg font-black text-slate-700 shadow-soft">‹</button></div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">Search a category and location, collect public business data, enrich websites, then save deduped records into the Intelligence Bank.</p>
          <div className="mt-6 space-y-4">
            <label className="block space-y-2"><span className="label">Business category / search</span><input className="input" value={businessType} onChange={(event) => setBusinessType(event.target.value)} /></label>
            <label className="block space-y-2"><span className="label">Location</span><input className="input" value={location} onChange={(event) => setLocation(event.target.value)} /></label>
            <label className="block space-y-2"><span className="label">Max results</span><EditableNumberInput className="input" min={1} max={200} value={maxResults} onChange={setMaxResults} /></label>
            <label className="block space-y-2"><span className="label">Extra search phrases, one per line</span><textarea className="input min-h-32" value={extraQueriesText} onChange={(event) => setExtraQueriesText(event.target.value)} /></label>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={findBusinesses} disabled={loading} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-60">{loading ? "Finding..." : "Find businesses"}</button>
            <button type="button" onClick={enrichWebsites} disabled={enriching || !visibleLeads.length} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 disabled:opacity-60">{enriching ? "Enriching..." : "Enrich websites"}</button>
            <button type="button" onClick={() => downloadCsv(selectedLeads)} disabled={!selectedLeads.length} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 disabled:opacity-60">Export Sheets CSV</button>
            <button type="button" onClick={copyForSheets} disabled={!selectedLeads.length} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 disabled:opacity-60">Copy for Sheets</button>
            <button type="button" onClick={saveToBank} disabled={banking || !selectedLeads.length} className="rounded-full border border-cyan-200 bg-cyan-50 px-5 py-3 text-sm font-black text-cyan-950 disabled:opacity-60">{banking ? "Saving..." : "Save to Bank"}</button>
            <button type="button" onClick={() => setLeads((prev) => alphabetizeAndDedupe(prev.map((lead) => ({ ...lead, selected: true }))))} disabled={!visibleLeads.length} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 disabled:opacity-60">Select all</button>
          </div>
          <div className="mt-6 rounded-3xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">{notice}</div>
        </section>
      )}

      <section className="card min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Results</p><h2 className="mt-2 text-3xl font-black text-slate-950">{visibleLeads.length} leads found</h2></div>
          <span className="badge">{selectedLeads.length} selected · A-Z</span>
        </div>
        <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200">
          <table className="min-w-[1200px] w-full divide-y divide-slate-200 bg-white text-sm">
            <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Use</th><th className="px-4 py-3">Business</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Email / form</th><th className="px-4 py-3">Website</th><th className="px-4 py-3">Score</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {visibleLeads.map((lead) => (
                <tr key={leadKey(lead)}>
                  <td className="px-4 py-4 align-top"><input type="checkbox" checked={lead.selected !== false} onChange={() => toggleLead(lead.id)} /></td>
                  <td className="px-4 py-4 align-top"><p className="font-black text-slate-950">{lead.businessName}</p><p className="mt-1 text-xs text-slate-500">{lead.address}</p><p className="mt-1 text-xs text-slate-400">Query: {lead.sourceQuery}</p></td>
                  <td className="px-4 py-4 align-top font-semibold text-slate-700">{lead.phone || "—"}</td>
                  <td className="px-4 py-4 align-top">{lead.publicEmails?.length ? lead.publicEmails.map((email) => <p key={email} className="font-semibold text-slate-700">{email}</p>) : lead.contactFormUrl ? <a href={lead.contactFormUrl} target="_blank" rel="noreferrer" className="font-bold underline">Contact form</a> : <span className="text-slate-400">Run enrichment</span>}</td>
                  <td className="px-4 py-4 align-top">{lead.website ? <a href={lead.website} target="_blank" rel="noreferrer" className="font-bold underline">Website</a> : "—"}{lead.googleMapsUrl && <a href={lead.googleMapsUrl} target="_blank" rel="noreferrer" className="ml-3 font-bold underline">Maps</a>}<p className="mt-1 text-xs text-slate-500">{lead.rating ? `${lead.rating} stars` : "No rating"} {lead.reviewCount ? `(${lead.reviewCount})` : ""}</p></td>
                  <td className="px-4 py-4 align-top"><ScorePill score={lead.leadScore} /></td>
                </tr>
              ))}
              {!visibleLeads.length && <tr><td colSpan={6} className="px-4 py-16 text-center text-slate-500">Search to build an alphabetized, duplicate-checked lead spreadsheet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
