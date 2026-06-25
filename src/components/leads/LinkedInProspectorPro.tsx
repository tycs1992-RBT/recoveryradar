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

type ProspectorResponse = { prospects?: ExecutiveProspect[]; notice?: string; errors?: string[]; error?: string };

const defaultTitles = ["CEO", "Founder", "Owner", "President", "Executive Director", "Clinical Director", "Operations Manager", "Practice Administrator", "Director of Operations", "Chief Executive Officer"].join("\n");

function clean(value: unknown) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function prospectKey(row: ExecutiveProspect) {
  if (row.profileUrl) return `linkedin:${row.profileUrl.toLowerCase()}`;
  return `person:${clean(row.name)}:${clean(row.company)}`;
}

function alphabetizeAndDedupe(rows: ExecutiveProspect[]) {
  const map = new Map<string, ExecutiveProspect>();
  for (const row of rows) {
    const key = prospectKey(row);
    const existing = map.get(key);
    if (!existing || row.confidence > existing.confidence) map.set(key, row);
  }
  return Array.from(map.values()).sort((a, b) => clean(a.name).localeCompare(clean(b.name)) || clean(a.company).localeCompare(clean(b.company)));
}

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function downloadCsv(rows: ExecutiveProspect[]) {
  const headers = ["Name", "Title", "Company", "LinkedIn URL", "Keyword", "Location", "Confidence"];
  const csv = [headers.map(csvEscape).join(","), ...rows.map((row) => [row.name, row.title, row.company, row.profileUrl, row.keyword, row.location, row.confidence].map(csvEscape).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "recovery-radar-executives-alphabetized.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function toSheets(rows: ExecutiveProspect[]) {
  const headers = ["Name", "Title", "Company", "LinkedIn URL", "Keyword", "Location", "Confidence"];
  return [headers.join("\t"), ...rows.map((row) => [row.name, row.title, row.company, row.profileUrl, row.keyword, row.location, row.confidence].map((value) => String(value ?? "").replace(/\t/g, " ").replace(/\n/g, " ")).join("\t"))].join("\n");
}

export function LinkedInProspectorPro() {
  const [keywordsText, setKeywordsText] = useState("ABA clinic\nABA therapy\nbehavior analyst clinic");
  const [location, setLocation] = useState("Florida");
  const [titlesText, setTitlesText] = useState(defaultTitles);
  const [maxResults, setMaxResults] = useState(5);
  const [prospects, setProspects] = useState<ExecutiveProspect[]>([]);
  const [notice, setNotice] = useState("All executive results are alphabetized by name and deduped by LinkedIn URL/name/company.");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [banking, setBanking] = useState(false);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);

  const visibleProspects = useMemo(() => alphabetizeAndDedupe(prospects), [prospects]);
  const selectedProspects = useMemo(() => alphabetizeAndDedupe(prospects.filter((prospect) => prospect.selected !== false)), [prospects]);

  function toggleProspect(id: string) {
    setProspects((prev) => alphabetizeAndDedupe(prev.map((prospect) => prospect.id === id ? { ...prospect, selected: prospect.selected === false } : prospect)));
  }

  async function runSearch() {
    setLoading(true);
    setErrors([]);
    setNotice("Searching public LinkedIn profile snippets...");
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
      setProspects(alphabetizeAndDedupe((data.prospects ?? []).map((prospect) => ({ ...prospect, selected: true }))));
      setNotice(data.notice ?? "Executive prospects returned, alphabetized, and duplicate-checked.");
      setErrors(data.errors ?? []);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "LinkedIn prospector search failed");
    } finally {
      setLoading(false);
    }
  }

  async function copyNames() {
    await navigator.clipboard.writeText(selectedProspects.map((prospect) => prospect.name).join("\n"));
    setNotice("Copied selected names alphabetically. Paste into LinkedIn search manually and review each person before connecting.");
  }

  async function copyForSheets() {
    await navigator.clipboard.writeText(toSheets(selectedProspects));
    setNotice("Copied selected executive prospects for Google Sheets in alphabetical order.");
  }

  async function saveToBank() {
    if (!selectedProspects.length) return;
    setBanking(true);
    setNotice("Saving selected executives to Intelligence Bank with duplicate checks...");
    try {
      const response = await fetch("/api/intelligence-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: selectedProspects.map((prospect) => ({
            recordType: "PERSON",
            name: prospect.name,
            companyName: prospect.company,
            role: prospect.title,
            linkedinUrl: prospect.profileUrl,
            sourceUrl: prospect.profileUrl,
            cityState: prospect.location,
            leadScore: prospect.confidence,
            sourceQuery: prospect.sourceQuery,
            sourceTool: "LinkedIn Prospector",
            notes: prospect.snippet
          }))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Bank save failed");
      setNotice(`${data.saved ?? selectedProspects.length} executive prospects saved to Intelligence Bank. Duplicates were skipped or updated.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Bank save failed");
    } finally {
      setBanking(false);
    }
  }

  return (
    <div className={`grid gap-6 ${controlsCollapsed ? "xl:grid-cols-[88px_minmax(0,1fr)]" : "xl:grid-cols-[0.78fr_1.22fr]"}`}>
      {controlsCollapsed ? (
        <section className="card h-fit p-3">
          <button
            type="button"
            onClick={() => setControlsCollapsed(false)}
            className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-white text-xl font-black text-slate-950 shadow-soft transition hover:bg-slate-50"
            aria-label="Expand executive search controls"
            title="Expand executive search controls"
          >
            ›
          </button>
          <div className="mt-4 flex flex-col items-center gap-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 [writing-mode:vertical-rl]">Executive Finder</p>
            <span className="rounded-full bg-slate-100 px-2 py-2 text-[10px] font-black text-slate-600 [writing-mode:vertical-rl]">{visibleProspects.length} results</span>
          </div>
        </section>
      ) : (
        <section className="card h-fit">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Executive finder</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">LinkedIn decision-maker prospector</h2>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="badge">A-Z + dedupe</span>
              <button
                type="button"
                onClick={() => setControlsCollapsed(true)}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-lg font-black text-slate-700 shadow-soft transition hover:bg-slate-50"
                aria-label="Minimize executive search controls"
                title="Minimize executive search controls"
              >
                ‹
              </button>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">Search indexed public LinkedIn profile snippets for executives. Results are alphabetized and can be saved to the Intelligence Bank.</p>
          <div className="mt-6 space-y-4">
            <label className="block space-y-2"><span className="label">Company / niche keywords, one per line</span><textarea className="input min-h-28" value={keywordsText} onChange={(event) => setKeywordsText(event.target.value)} /></label>
            <label className="block space-y-2"><span className="label">Location / market</span><input className="input" value={location} onChange={(event) => setLocation(event.target.value)} /></label>
            <label className="block space-y-2"><span className="label">Target titles, one per line</span><textarea className="input min-h-36" value={titlesText} onChange={(event) => setTitlesText(event.target.value)} /></label>
            <label className="block space-y-2"><span className="label">Max results per keyword</span><EditableNumberInput className="input" min={1} max={10} value={maxResults} onChange={setMaxResults} /></label>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={runSearch} disabled={loading} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-60">{loading ? "Searching..." : "Find executives"}</button>
            <button type="button" onClick={() => setProspects((prev) => alphabetizeAndDedupe(prev.map((prospect) => ({ ...prospect, selected: true }))))} disabled={!visibleProspects.length} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 disabled:opacity-60">Select all</button>
            <button type="button" onClick={copyNames} disabled={!selectedProspects.length} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 disabled:opacity-60">Copy names</button>
            <button type="button" onClick={copyForSheets} disabled={!selectedProspects.length} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 disabled:opacity-60">Copy for Sheets</button>
            <button type="button" onClick={() => downloadCsv(selectedProspects)} disabled={!selectedProspects.length} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 disabled:opacity-60">Export CSV</button>
            <button type="button" onClick={saveToBank} disabled={banking || !selectedProspects.length} className="rounded-full border border-cyan-200 bg-cyan-50 px-5 py-3 text-sm font-black text-cyan-950 disabled:opacity-60">{banking ? "Saving..." : "Save to Bank"}</button>
          </div>
          <div className="mt-6 rounded-3xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">{notice}</div>
          {errors.length > 0 && <div className="mt-4 rounded-3xl bg-amber-50 p-4 text-xs leading-5 text-amber-900"><p className="font-black">Search notes</p>{errors.slice(0, 5).map((error) => <p key={error}>{error}</p>)}</div>}
        </section>
      )}

      <section className="card min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Results</p><h2 className="mt-2 text-3xl font-black text-slate-950">{visibleProspects.length} executive prospects</h2></div><span className="badge">{selectedProspects.length} selected · A-Z</span></div>
        <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200">
          <table className="min-w-[1100px] w-full divide-y divide-slate-200 bg-white text-sm">
            <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Use</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Title</th><th className="px-4 py-3">Company</th><th className="px-4 py-3">Profile</th><th className="px-4 py-3">Confidence</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {visibleProspects.map((prospect) => (
                <tr key={prospectKey(prospect)}>
                  <td className="px-4 py-4 align-top"><input type="checkbox" checked={prospect.selected !== false} onChange={() => toggleProspect(prospect.id)} /></td>
                  <td className="px-4 py-4 align-top font-black text-slate-950">{prospect.name}</td>
                  <td className="px-4 py-4 align-top text-slate-700">{prospect.title}</td>
                  <td className="px-4 py-4 align-top text-slate-700">{prospect.company}</td>
                  <td className="px-4 py-4 align-top"><a href={prospect.profileUrl} target="_blank" rel="noreferrer" className="font-bold underline">LinkedIn</a><p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{prospect.snippet}</p></td>
                  <td className="px-4 py-4 align-top"><span className="badge bg-emerald-50 text-emerald-700">{prospect.confidence}/100</span></td>
                </tr>
              ))}
              {!visibleProspects.length && <tr><td colSpan={6} className="px-4 py-16 text-center text-slate-500">Search to find alphabetized, duplicate-checked executive profiles.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
