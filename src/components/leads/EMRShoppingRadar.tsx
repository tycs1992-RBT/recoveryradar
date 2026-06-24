"use client";

import { useMemo, useState } from "react";
import { ScoreReasonsPanel } from "@/components/leads/ScoreReasonsPanel";
import { emrShoppingKeywords, type RadarPlatform, type RadarResult } from "@/lib/emr-shopping-radar";

const platforms: RadarPlatform[] = ["facebook", "linkedin", "reddit", "google", "news", "blogs"];

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function downloadCsv(results: RadarResult[]) {
  const header = ["Title", "Platform", "Lead Score", "Shopping Intent", "Pain Level", "Decision Maker Probability", "Clinic Probability", "Keyword", "Link", "Snippet", "Query"];
  const rows = results.map((result) => [
    result.title,
    result.platform,
    result.leadScore,
    result.shoppingIntentScore,
    result.painLevelScore,
    result.decisionMakerProbability,
    result.clinicProbability,
    result.keyword,
    result.link,
    result.snippet,
    result.query
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "emr-shopping-radar-results.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function replyAngle(result: RadarResult) {
  return [
    "Human-reviewed reply angle:",
    "",
    `I saw this public discussion around ${result.keyword}. Before switching ABA systems, it may be worth calculating how many hours are disappearing through cancellations, callouts, recovery routing gaps, caregiver communication, and documentation cleanup.`,
    "",
    "Infinite Suite OS™ is built as a recovery layer beside the current EMR, not another migration-first pitch.",
    "",
    "Lost Hours Calculator: https://www.infinitepieces.ai/calculator",
    `Source reviewed: ${result.link}`
  ].join("\n");
}

export function EMRShoppingRadar() {
  const [location, setLocation] = useState("United States");
  const [keywordText, setKeywordText] = useState(emrShoppingKeywords.slice(0, 8).join("\n"));
  const [selectedPlatforms, setSelectedPlatforms] = useState<RadarPlatform[]>(["facebook", "linkedin", "reddit", "google", "news", "blogs"]);
  const [recency, setRecency] = useState<"day" | "week" | "month">("week");
  const [saveToBank, setSaveToBank] = useState(false);
  const [results, setResults] = useState<RadarResult[]>([]);
  const [notice, setNotice] = useState("Ready. This uses public indexed sources only. Facebook mode searches public indexed Facebook pages/posts, not private groups.");
  const [loading, setLoading] = useState(false);
  const [savingLink, setSavingLink] = useState<string | null>(null);

  const keywords = useMemo(() => keywordText.split(/\n|,/).map((item) => item.trim()).filter(Boolean).slice(0, 25), [keywordText]);

  function togglePlatform(platform: RadarPlatform) {
    setSelectedPlatforms((current) => current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform]);
  }

  async function runRadar() {
    setLoading(true);
    setNotice("Running EMR Shopping Radar across public indexed sources...");
    try {
      const response = await fetch("/api/emr-shopping-radar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords, location, platforms: selectedPlatforms, maxPerQuery: 5, recency, saveToBank })
      });
      const data = await response.json();
      if (!response.ok) {
        setNotice(data.error ?? "Radar search failed.");
        return;
      }
      setResults(data.results ?? []);
      setNotice(data.notice ?? `${data.count ?? 0} signals found.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Radar search failed.");
    } finally {
      setLoading(false);
    }
  }

  async function saveSource(result: RadarResult) {
    setSavingLink(result.link);
    try {
      const response = await fetch("/api/intelligence-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: [{
            recordType: "SOURCE",
            name: result.title,
            companyName: result.inferredCompany || result.title,
            sourceUrl: result.link,
            leadScore: result.leadScore,
            sourceQuery: result.query,
            sourceTool: "EMR Shopping Radar",
            notes: [
              result.snippet,
              `Platform: ${result.platform}`,
              `Keyword: ${result.keyword}`,
              `Shopping intent: ${result.shoppingIntentScore}`,
              `Pain level: ${result.painLevelScore}`,
              `Decision-maker probability: ${result.decisionMakerProbability}`,
              `Clinic probability: ${result.clinicProbability}`,
              replyAngle(result)
            ].join("\n")
          }]
        })
      });
      const data = await response.json();
      setNotice(response.ok ? data.notice ?? "Saved to Intelligence Bank." : data.error ?? "Save failed.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSavingLink(null);
    }
  }

  async function copyReply(result: RadarResult) {
    await navigator.clipboard.writeText(replyAngle(result));
    setNotice("Copied human-reviewed reply angle. Open and verify the public source first.");
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">EMR Shopping Radar™</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Recent ABA software shopping intelligence</h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">Search recent public indexed Facebook pages/posts, LinkedIn indexed pages, Reddit, Google, news and blogs for ABA EMR shopping, complaints, alternatives and replacement signals. Results are scored and can be saved to the Intelligence Bank.</p>
          </div>
          <span className="badge bg-cyan-50 text-cyan-800">Public indexed sources only</span>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <label className="block space-y-2">
            <span className="label">Shopping keywords, one per line</span>
            <textarea className="input min-h-44" value={keywordText} onChange={(event) => setKeywordText(event.target.value)} />
          </label>
          <div className="space-y-4">
            <label className="block space-y-2"><span className="label">Location / market</span><input className="input" value={location} onChange={(event) => setLocation(event.target.value)} /></label>
            <label className="block space-y-2"><span className="label">Recency</span><select className="input" value={recency} onChange={(event) => setRecency(event.target.value as typeof recency)}><option value="day">Last day</option><option value="week">Last week</option><option value="month">Last month</option></select></label>
            <div className="rounded-3xl border border-slate-200 p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Sources</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {platforms.map((platform) => <button key={platform} type="button" onClick={() => togglePlatform(platform)} className={`badge ${selectedPlatforms.includes(platform) ? "bg-slate-950 text-white" : "bg-slate-50"}`}>{platform}</button>)}
              </div>
            </div>
            <label className="flex gap-3 rounded-3xl border border-slate-200 p-4 text-sm font-semibold text-slate-700"><input type="checkbox" checked={saveToBank} onChange={(event) => setSaveToBank(event.target.checked)} /> Save deduped results to Intelligence Bank automatically</label>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={runRadar} disabled={loading || !keywords.length || !selectedPlatforms.length} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-50">{loading ? "Scanning..." : "Run EMR Shopping Radar"}</button>
          <button type="button" onClick={() => downloadCsv(results)} disabled={!results.length} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 disabled:opacity-50">Export CSV</button>
          <button type="button" onClick={() => setKeywordText(emrShoppingKeywords.join("\n"))} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700">Load full keyword bank</button>
        </div>
        <div className="mt-5 rounded-3xl bg-blue-50 p-4 text-sm font-semibold leading-6 text-blue-950">{notice}</div>
      </section>

      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-black text-slate-950">Radar results</h2>
          <span className="badge bg-slate-50">{results.length} results</span>
        </div>
        <div className="mt-5 space-y-4">
          {results.length ? results.map((result) => (
            <article key={result.link} className="rounded-3xl border border-slate-200 p-5">
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-cyan-50 text-cyan-800">{result.platform}</span>
                <span className="badge bg-emerald-50 text-emerald-800">Lead {result.leadScore}</span>
                <span className="badge bg-amber-50 text-amber-800">{result.leadTemperature}</span>
                <span className="badge bg-slate-50">{result.keyword}</span>
              </div>
              <h3 className="mt-3 text-xl font-black text-slate-950">{result.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{result.snippet}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-400">Shopping intent</p><p className="font-black text-slate-950">{result.shoppingIntentScore}</p></div>
                <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-400">Pain level</p><p className="font-black text-slate-950">{result.painLevelScore}</p></div>
                <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-400">Decision-maker</p><p className="font-black text-slate-950">{result.decisionMakerProbability}</p></div>
                <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-400">Clinic probability</p><p className="font-black text-slate-950">{result.clinicProbability}</p></div>
              </div>
              <ScoreReasonsPanel result={result.scoreReasons} />
              <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">{result.riskNote}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href={result.link} target="_blank" rel="noreferrer" className="text-xs font-black text-slate-950 underline">Open public source</a>
                <button type="button" onClick={() => copyReply(result)} className="text-xs font-black text-slate-950 underline">Copy reply angle</button>
                <button type="button" onClick={() => saveSource(result)} disabled={savingLink === result.link} className="text-xs font-black text-slate-950 underline disabled:opacity-50">{savingLink === result.link ? "Saving..." : "Save source"}</button>
              </div>
            </article>
          )) : <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">Run radar to find recent public EMR-shopping signals.</div>}
        </div>
      </section>
    </div>
  );
}
