"use client";

import { useState } from "react";
import { ScoreReasonsPanel } from "@/components/leads/ScoreReasonsPanel";
import { scoreReasonsForDisplay } from "@/lib/score-reasons-ui";

type SearchPreview = {
  title: string;
  link: string;
  snippet: string;
  suggestedSignal: string;
  leadTemperature?: "hot" | "warm" | "research";
};

const defaultQuery = 'ABA EMR CentralReach alternative OR problem OR recommend';

const presets = [
  'ABA EMR CentralReach alternative OR replacement OR recommend',
  'site:reddit.com ABA CentralReach OR Rethink OR Motivity alternative OR problem',
  'ABA clinic software switching OR "looking for" OR frustrated',
  '"CentralReach alternative" OR "RethinkBH alternative" OR "Motivity alternative"'
];

const allowedHosts = ["facebook.com", "reddit.com", "linkedin.com", "threads.net", "x.com", "twitter.com"];
const unwantedWords = ["job opening", "now hiring", "salary range", "indeed.com", "ziprecruiter", "glassdoor"];
const buyerWords = ["alternative", "replacement", "recommend", "looking for", "problem", "issue", "frustrated", "switching", "switch", "compare", " vs ", "best", "hate", "struggling", "anyone use"];
const softwareWords = ["emr", "ehr", "centralreach", "rethink", "motivity", "catalyst", "atrack", "software", "practice management", "aba"];

function host(link: string) {
  try {
    return new URL(link).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return link.toLowerCase();
  }
}

function isAllowedSocial(link: string) {
  const current = host(link);
  return allowedHosts.some((item) => current === item || current.endsWith(`.${item}`));
}

// Relaxed gate: keep a result if it looks relevant at all — a software mention OR a
// buyer signal is enough (not both). Social-host preference is applied as a SORT, not a
// hard drop, so a strong on-topic result isn't discarded just for living off-platform.
function keepResult(result: SearchPreview) {
  const text = `${result.title} ${result.snippet}`.toLowerCase();
  if (unwantedWords.some((word) => text.includes(word))) return false;
  return softwareWords.some((word) => text.includes(word)) || buyerWords.some((word) => text.includes(word));
}

function replyAngle(result: SearchPreview) {
  return [
    "Possible human reply angle:",
    "",
    "I saw your post about ABA software/EMR alternatives. I’m building Infinite Suite OS™ around the recovery gap many clinics hit before they migrate: cancellations, RBT callouts, caregiver communication and documentation cleanup turning into lost hours.",
    "",
    "No PHI needed — the first step is just calculating a clinic-level lost-hours baseline:",
    "https://www.infinitepieces.ai/calculator",
    "",
    `Source: ${result.link}`
  ].join("\n");
}

export function SocialEMRSourceFinder() {
  const [query, setQuery] = useState(defaultQuery);
  const [location, setLocation] = useState("United States");
  const [results, setResults] = useState<SearchPreview[]>([]);
  const [notice, setNotice] = useState("Search is restricted to public social platforms only: Facebook, Reddit, LinkedIn, Threads/X. Generic vendor pages are removed.");
  const [loading, setLoading] = useState(false);
  const [savingLink, setSavingLink] = useState<string | null>(null);

  async function runSearch() {
    setLoading(true);
    setNotice("Searching public social sources...");
    try {
      const response = await fetch("/api/intent-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: query, location })
      });
      const payload = await response.json();
      const filtered = (payload.results ?? []).filter(keepResult);
      const deduped = Array.from(new Map(filtered.map((item: SearchPreview) => [item.link, item])).values()) as SearchPreview[];
      // Prefer social-platform sources (sort them first) instead of discarding the rest.
      const sorted = deduped.sort((a, b) => Number(isAllowedSocial(b.link)) - Number(isAllowedSocial(a.link)));
      setResults(sorted);
      const socialCount = sorted.filter((r) => isAllowedSocial(r.link)).length;
      setNotice(
        sorted.length
          ? `${sorted.length} public source${sorted.length === 1 ? "" : "s"} matched (${socialCount} on social platforms, shown first). Open each and review context manually before outreach.`
          : "0 results. Try a simpler query (e.g. \"CentralReach alternative\") — heavy site: operators and long OR-chains often return nothing. Confirm SERPAPI_API_KEY is set."
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  async function copyReply(result: SearchPreview) {
    await navigator.clipboard.writeText(replyAngle(result));
    setNotice("Copied human-reviewed reply angle. Open the social post manually before contacting anyone.");
  }

  async function saveSource(result: SearchPreview) {
    setSavingLink(result.link);
    try {
      const score = scoreReasonsForDisplay({ title: result.title, snippet: result.snippet, sourceSignal: result.suggestedSignal });
      const response = await fetch("/api/intelligence-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: [{
            recordType: "COMPANY",
            name: result.title,
            companyName: result.title,
            sourceUrl: result.link,
            leadScore: score.score,
            sourceQuery: query,
            sourceTool: "Social Source Finder",
            notes: `${result.snippet}\n\n${replyAngle(result)}`
          }]
        })
      });
      const data = await response.json();
      setNotice(response.ok ? data.notice ?? "Saved social source to Intelligence Bank." : data.error ?? "Save failed.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSavingLink(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="card">
        <h2 className="text-2xl font-black text-slate-950">Social-only ABA EMR source finder</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Find public social posts and discussions where people are asking about ABA EMR alternatives, replacements, recommendations, or software problems. This avoids random vendor websites.
        </p>
        <div className="mt-6 space-y-4">
          <label className="space-y-2 block">
            <span className="label">Public social search query</span>
            <textarea className="input min-h-32" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">Quick presets</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {presets.map((preset, index) => (
                <button key={preset} type="button" onClick={() => setQuery(preset)} className="badge bg-slate-50 hover:bg-cyan-50">
                  Social preset {index + 1}
                </button>
              ))}
            </div>
          </div>
          <label className="space-y-2 block">
            <span className="label">Location filter</span>
            <input className="input" value={location} onChange={(event) => setLocation(event.target.value)} />
          </label>
          <button type="button" onClick={runSearch} disabled={loading} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-50">
            {loading ? "Searching..." : "Find public social sources"}
          </button>
        </div>
        <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Public sources only. Open each source and review context manually before outreach.
        </div>
      </section>

      <section className="card">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-slate-950">Filtered social results</h2>
          <span className="badge">Vendor sites removed</span>
        </div>
        <p className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">{notice}</p>
        <div className="mt-5 space-y-4">
          {results.length ? results.map((result) => {
            const score = scoreReasonsForDisplay({ title: result.title, snippet: result.snippet, sourceSignal: result.suggestedSignal });
            return (
              <article key={result.link} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge bg-cyan-50 text-cyan-800">{host(result.link)}</span>
                  {result.leadTemperature ? <span className="badge bg-amber-50 text-amber-800">{result.leadTemperature}</span> : null}
                  <span className="badge bg-emerald-50 text-emerald-800">Score {score.score}</span>
                </div>
                <p className="mt-3 font-black text-slate-950">{result.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{result.snippet}</p>
                <ScoreReasonsPanel result={score} />
                <div className="mt-3 flex flex-wrap gap-3">
                  <a href={result.link} target="_blank" rel="noreferrer" className="inline-flex text-xs font-black text-slate-950 underline">Open public social source</a>
                  <button type="button" onClick={() => copyReply(result)} className="text-xs font-black text-slate-950 underline">Copy human reply angle</button>
                  <button type="button" onClick={() => saveSource(result)} disabled={savingLink === result.link} className="text-xs font-black text-slate-950 underline disabled:opacity-50">{savingLink === result.link ? "Saving..." : "Save source"}</button>
                </div>
              </article>
            );
          }) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Run a search to find public social EMR-shopping sources.</div>
          )}
        </div>
      </section>
    </div>
  );
}
