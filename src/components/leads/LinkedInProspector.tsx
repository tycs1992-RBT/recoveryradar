"use client";

import { useMemo, useState } from "react";
import { EditableNumberInput } from "@/components/ui/EditableNumberInput";

type ExecutiveProspect = {
  id: string;
  name: string;
  title: string;
  company: string;
  profileUrl: string;
  snippet: string;
  keyword: string;
  location: string;
  sourceQuery: string;
  confidence: number;
  nextStep: string;
  selected?: boolean;
};

type ProspectorResponse = {
  prospects?: ExecutiveProspect[];
  notice?: string;
  errors?: string[];
  error?: string;
};

const defaultTitles = [
  "CEO",
  "Founder",
  "Owner",
  "President",
  "Executive Director",
  "Clinical Director",
  "Operations Manager",
  "Practice Administrator",
  "Director of Operations",
  "Chief Executive Officer"
].join("\n");

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
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

function exportRows(rows: ExecutiveProspect[]) {
  const headers = ["Name", "Title", "Company", "LinkedIn URL", "Keyword", "Location", "Confidence", "Source Query", "Snippet"];
  return [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => [
      row.name,
      row.title,
      row.company,
      row.profileUrl,
      row.keyword,
      row.location,
      row.confidence,
      row.sourceQuery,
      row.snippet
    ].map(csvEscape).join(","))
  ].join("\n");
}

function toSheetsTsv(rows: ExecutiveProspect[]) {
  const headers = ["Name", "Title", "Company", "LinkedIn URL", "Keyword", "Location", "Confidence"];
  const body = rows.map((row) => [row.name, row.title, row.company, row.profileUrl, row.keyword, row.location, row.confidence]
    .map((value) => String(value ?? "").replace(/\t/g, " ").replace(/\n/g, " ")).join("\t"));
  return [headers.join("\t"), ...body].join("\n");
}

export function LinkedInProspector() {
  const [keywordsText, setKeywordsText] = useState("ABA clinic\nABA therapy\nbehavior analyst clinic");
  const [location, setLocation] = useState("Florida");
  const [titlesText, setTitlesText] = useState(defaultTitles);
  const [maxResults, setMaxResults] = useState(5);
  const [prospects, setProspects] = useState<ExecutiveProspect[]>([]);
  const [notice, setNotice] = useState("Search Google-indexed public LinkedIn profile results for clinic owners, founders, directors and operations leaders. Manual review required.");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedProspects = useMemo(() => prospects.filter((prospect) => prospect.selected !== false), [prospects]);

  function toggleProspect(id: string) {
    setProspects((prev) => prev.map((prospect) => prospect.id === id ? { ...prospect, selected: prospect.selected === false } : prospect));
  }

  async function runSearch() {
    setLoading(true);
    setErrors([]);
    setNotice("Searching public LinkedIn profile snippets through SerpApi...");
    try {
      const response = await fetch("/api/linkedin-prospector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: keywordsText.split("\n").map((line) => line.trim()).filter(Boolean),
          location,
          titles: titlesText.split("\n").map((line) => line.trim()).filter(Boolean),
          maxResults
        })
      });
      const data = (await response.json()) as ProspectorResponse;
      if (!response.ok) throw new Error(data.error ?? "LinkedIn prospector search failed");
      setProspects((data.prospects ?? []).map((prospect) => ({ ...prospect, selected: true })));
      setNotice(data.notice ?? "Prospects returned. Review every profile manually before outreach.");
      setErrors(data.errors ?? []);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "LinkedIn prospector search failed");
    } finally {
      setLoading(false);
    }
  }

  async function copyNames() {
    const text = selectedProspects.map((prospect) => prospect.name).join("\n");
    await navigator.clipboard.writeText(text);
    setNotice("Copied selected names. Paste into LinkedIn search manually and review each person before connecting.");
  }

  async function copyForSheets() {
    await navigator.clipboard.writeText(toSheetsTsv(selectedProspects));
    setNotice("Copied selected executive prospects for Google Sheets. Open Sheets, click cell A1, and paste.");
  }

  function exportCsv() {
    downloadBlob("recovery-radar-linkedin-executive-prospects.csv", exportRows(selectedProspects), "text/csv;charset=utf-8");
    setNotice("Downloaded executive prospect CSV. Review manually before outreach.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
      <section className="card h-fit">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Executive finder</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">LinkedIn decision-maker prospector</h2>
          </div>
          <span className="badge">Public search only</span>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Search indexed public LinkedIn profile snippets for CEOs, founders, owners, clinical directors and operations leaders. This does not log into LinkedIn, scrape private pages, or send automated messages.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="label">Company / niche keywords, one per line</span>
            <textarea className="input min-h-28" value={keywordsText} onChange={(event) => setKeywordsText(event.target.value)} />
          </label>
          <label className="block space-y-2">
            <span className="label">Location / market</span>
            <input className="input" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Florida, Tampa, Texas, United States..." />
          </label>
          <label className="block space-y-2">
            <span className="label">Target titles, one per line</span>
            <textarea className="input min-h-36" value={titlesText} onChange={(event) => setTitlesText(event.target.value)} />
          </label>
          <label className="block space-y-2">
            <span className="label">Max results per keyword</span>
            <EditableNumberInput className="input" min={1} max={10} value={maxResults} onChange={setMaxResults} />
          </label>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={runSearch} disabled={loading} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-60">
            {loading ? "Searching..." : "Find executives"}
          </button>
          <button type="button" onClick={() => setProspects((prev) => prev.map((prospect) => ({ ...prospect, selected: true })))} disabled={!prospects.length} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60">
            Select all
          </button>
          <button type="button" onClick={copyNames} disabled={!selectedProspects.length} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60">
            Copy names
          </button>
          <button type="button" onClick={copyForSheets} disabled={!selectedProspects.length} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60">
            Copy for Sheets
          </button>
          <button type="button" onClick={exportCsv} disabled={!selectedProspects.length} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60 sm:col-span-2">
            Export CSV
          </button>
        </div>

        <div className="mt-6 rounded-3xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">{notice}</div>
        {errors.length > 0 && (
          <div className="mt-4 rounded-3xl bg-amber-50 p-4 text-xs leading-5 text-amber-900">
            <p className="font-black">Search notes</p>
            {errors.slice(0, 5).map((error) => <p key={error}>{error}</p>)}
          </div>
        )}
      </section>

      <section className="card min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Results</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">{prospects.length} executive prospects</h2>
          </div>
          <span className="badge">{selectedProspects.length} selected</span>
        </div>

        <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200">
          <table className="min-w-[1100px] w-full divide-y divide-slate-200 bg-white text-sm">
            <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Use</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Profile</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prospects.map((prospect) => (
                <tr key={prospect.id}>
                  <td className="px-4 py-4 align-top"><input type="checkbox" checked={prospect.selected !== false} onChange={() => toggleProspect(prospect.id)} /></td>
                  <td className="px-4 py-4 align-top font-black text-slate-950">{prospect.name}</td>
                  <td className="px-4 py-4 align-top text-slate-700">{prospect.title}</td>
                  <td className="px-4 py-4 align-top text-slate-700">{prospect.company}</td>
                  <td className="px-4 py-4 align-top">
                    <a href={prospect.profileUrl} target="_blank" rel="noreferrer" className="font-bold underline">LinkedIn</a>
                    <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{prospect.snippet}</p>
                  </td>
                  <td className="px-4 py-4 align-top"><span className="badge bg-emerald-50 text-emerald-700">{prospect.confidence}/100</span></td>
                  <td className="px-4 py-4 align-top">
                    <p className="text-xs font-semibold text-slate-500">{prospect.keyword}</p>
                    <p className="mt-1 max-w-xs text-[11px] leading-5 text-slate-400">{prospect.nextStep}</p>
                  </td>
                </tr>
              ))}
              {!prospects.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-slate-500">Search to find Google-indexed public LinkedIn executive profiles.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
