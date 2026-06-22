"use client";

import { useMemo, useState } from "react";
import { keywordGroups } from "@/lib/constants";
import { EditableNumberInput } from "@/components/ui/EditableNumberInput";

type SearchPreview = {
  title: string;
  link: string;
  snippet: string;
  suggestedSignal: string;
  keyword?: string;
  query?: string;
  inferredCompany?: string;
  nextStep?: string;
  leadTemperature?: "hot" | "warm" | "research";
  whyItMatters?: string;
  riskNote?: string;
};

const signalPresets = [
  "ABA clinic cancellation callout scheduling pain",
  "ABA clinic owner CentralReach problem",
  "ABA clinic hiring scheduler operations manager",
  "ABA therapy new clinic opening hiring",
  "ABA clinic billing documentation authorization problem"
];

export function IntentFinderPanel() {
  const [keyword, setKeyword] = useState("new ABA clinic hiring scheduler");
  const [location, setLocation] = useState("Florida");
  const [groupName, setGroupName] = useState(keywordGroups[0]?.groupName ?? "EMR shoppers");
  const [maxResults, setMaxResults] = useState(5);
  const [results, setResults] = useState<SearchPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<"single" | "group">("group");

  const selectedGroup = useMemo(() => keywordGroups.find((group) => group.groupName === groupName), [groupName]);

  async function runSearch() {
    setLoading(true);
    setNotice(null);
    try {
      const response = await fetch("/api/intent-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, location })
      });
      const payload = await response.json();
      setResults(payload.results ?? []);
      setNotice(payload.notice ?? null);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function runGroupCrawl() {
    setLoading(true);
    setNotice(null);
    try {
      const response = await fetch("/api/intent-finder/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName, location, maxResults })
      });
      const payload = await response.json();
      setResults(payload.results ?? []);
      setNotice(payload.notice ?? payload.error ?? null);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Crawler failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="card">
        <h2 className="text-2xl font-black text-slate-950">Public Signal Intelligence crawler</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Use SerpApi or public search APIs to find indexed buyer-intent signals, clinic openings, hiring, software pain and operational complaints. Every source is reviewed before outreach.
        </p>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("group")}
              className={`rounded-2xl px-4 py-3 text-sm font-black ${mode === "group" ? "bg-slate-950 text-white" : "bg-white text-slate-700"}`}
            >
              Crawl keyword group
            </button>
            <button
              type="button"
              onClick={() => setMode("single")}
              className={`rounded-2xl px-4 py-3 text-sm font-black ${mode === "single" ? "bg-slate-950 text-white" : "bg-white text-slate-700"}`}
            >
              Single query
            </button>
          </div>
        </div>

        {mode === "group" ? (
          <div className="mt-6 space-y-4">
            <label className="space-y-2 block">
              <span className="label">Keyword group</span>
              <select className="input" value={groupName} onChange={(event) => setGroupName(event.target.value)}>
                {keywordGroups.map((group) => (
                  <option key={group.groupName} value={group.groupName}>{group.groupName}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 block">
              <span className="label">Location filter</span>
              <input className="input" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Florida, Texas, Georgia..." />
            </label>
            <label className="space-y-2 block">
              <span className="label">Max results per keyword</span>
              <EditableNumberInput className="input" min={1} max={10} value={maxResults} onChange={setMaxResults} />
            </label>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Queries in this group</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedGroup?.keywords.map((item) => (
                  <span key={item} className="badge bg-slate-50">{item}</span>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={runGroupCrawl}
              disabled={loading}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-50"
            >
              {loading ? "Crawling public signals..." : "Run intent crawler"}
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <label className="space-y-2 block">
              <span className="label">Keyword / signal query</span>
              <input className="input" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
            </label>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Pain signal presets</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {signalPresets.map((preset) => (
                  <button key={preset} type="button" onClick={() => setKeyword(preset)} className="badge bg-slate-50 hover:bg-cyan-50">
                    {preset}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">Advanced query operators are supported. Use single query mode for highly specific public-source research, then verify every result manually.</p>
            </div>
            <label className="space-y-2 block">
              <span className="label">Location filter</span>
              <input className="input" value={location} onChange={(event) => setLocation(event.target.value)} />
            </label>
            <button
              type="button"
              onClick={runSearch}
              disabled={loading}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-50"
            >
              {loading ? "Searching..." : "Find public signals"}
            </button>
          </div>
        )}

        <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <strong>Manual-review rule:</strong> use this to discover leads and source URLs. Use indexed public sources only. Do not auto-message or add leads without your review.
        </div>
      </section>

      <section className="card">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-slate-950">Signal preview</h2>
          <span className="badge">Manual review required</span>
        </div>
        {notice ? <p className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">{notice}</p> : null}
        <div className="mt-5 space-y-4">
          {results.length ? (
            results.map((result, index) => (
              <article key={`${result.link}-${index}`} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {result.keyword ? <span className="badge bg-slate-50">{result.keyword}</span> : null}
                  <span className="badge bg-cyan-50 text-cyan-800">{result.suggestedSignal}</span>
                  {result.leadTemperature ? <span className="badge bg-amber-50 text-amber-800">{result.leadTemperature}</span> : null}
                  {result.inferredCompany ? <span className="badge bg-emerald-50 text-emerald-800">Company guess: {result.inferredCompany}</span> : null}
                </div>
                <p className="mt-3 font-black text-slate-950">{result.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{result.snippet}</p>
                {result.whyItMatters ? <p className="mt-2 rounded-2xl bg-slate-50 p-3 text-xs font-semibold leading-5 text-slate-600">{result.whyItMatters}</p> : null}
                {result.query ? <p className="mt-2 text-xs font-semibold text-slate-400">Query: {result.query}</p> : null}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <a href={result.link} target="_blank" rel="noreferrer" className="text-xs font-bold text-slate-950 underline">
                    Open public source
                  </a>
                  <span className="text-xs font-semibold text-slate-500">{result.nextStep ?? "Review source manually before adding a lead."}</span>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              Run the intent crawler to preview public signals. Configure SerpApi or Google Custom Search in Vercel for live results.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
