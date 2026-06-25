"use client";

import { useMemo, useState } from "react";
import { ScoreReasonsPanel } from "@/components/leads/ScoreReasonsPanel";
import { scoreReasonsForDisplay } from "@/lib/score-reasons-ui";
import { EditableNumberInput } from "@/components/ui/EditableNumberInput";

type SearchPreview = {
  title: string;
  link: string;
  snippet: string;
  suggestedSignal: string;
  leadTemperature?: "hot" | "warm" | "research";
};

type PlatformKey = "facebook" | "linkedin" | "reddit" | "threads" | "x";

type PlatformConfig = {
  key: PlatformKey;
  label: string;
  domain: string;
};

const platforms: PlatformConfig[] = [
  { key: "facebook", label: "Facebook", domain: "facebook.com" },
  { key: "linkedin", label: "LinkedIn", domain: "linkedin.com" },
  { key: "reddit", label: "Reddit", domain: "reddit.com" },
  { key: "threads", label: "Threads", domain: "threads.net" },
  { key: "x", label: "X / Twitter", domain: "x.com" }
];

const defaultQuery = '("CentralReach alternative" OR "RethinkBH alternative" OR "Motivity alternative" OR "Catalyst ABA alternative" OR "ABA EMR alternative" OR "ABA software recommendation" OR "looking for ABA software" OR "switching ABA software") -jobs -salary -hiring';

const presets = [
  '("CentralReach alternative" OR "RethinkBH alternative" OR "Motivity alternative" OR "Catalyst ABA alternative" OR "ABA EMR alternative") -jobs -salary -hiring',
  '(ABA OR BCBA OR "ABA clinic") (EMR OR EHR OR "practice management software") (recommend OR "looking for" OR alternative OR replacement OR switching) -jobs -salary -hiring',
  '(CentralReach OR Rethink OR Motivity OR Catalyst OR ATrack) (problem OR issue OR frustrated OR dislike OR switching OR replacement) (ABA OR BCBA) -jobs -salary',
  '("best ABA software" OR "ABA practice management software" OR "ABA EMR comparison") (recommend OR compare OR alternative) -jobs -salary -training'
];

const allowedHosts = ["facebook.com", "reddit.com", "linkedin.com", "threads.net", "x.com", "twitter.com"];
const unwantedWords = ["job", "jobs", "salary", "hiring", "indeed", "ziprecruiter", "glassdoor", "career", "course", "certification"];

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

function keepResult(result: SearchPreview) {
  const text = `${result.title} ${result.snippet}`.toLowerCase();
  if (!isAllowedSocial(result.link)) return false;
  if (unwantedWords.some((word) => text.includes(word))) return false;
  return true;
}

function replyAngle(result: SearchPreview) {
  return [
    "Possible human reply angle:",
    "",
    "I saw your public post about ABA software/EMR alternatives. I’m building Infinite Suite OS™ around the recovery gap many clinics hit before they migrate: cancellations, RBT callouts, caregiver communication and documentation cleanup turning into lost hours.",
    "",
    "No PHI needed — the first step is just calculating a clinic-level lost-hours baseline:",
    "https://www.infinitepieces.ai/calculator",
    "",
    `Source: ${result.link}`
  ].join("\n");
}

export function SocialEMRSourceFinder() {
  const [query, setQuery] = useState(defaultQuery);
  const [location, setLocation] = useState("Florida");
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformKey[]>(["facebook", "linkedin"]);
  const [maxResultsPerPlatform, setMaxResultsPerPlatform] = useState(15);
  const [results, setResults] = useState<SearchPreview[]>([]);
  const [notice, setNotice] = useState("Facebook and LinkedIn are selected. Each platform is searched separately through Brave so one platform cannot crowd out the other.");
  const [loading, setLoading] = useState(false);
  const [savingLink, setSavingLink] = useState<string | null>(null);

  const selectedConfigs = useMemo(
    () => platforms.filter((platform) => selectedPlatforms.includes(platform.key)),
    [selectedPlatforms]
  );

  function togglePlatform(key: PlatformKey) {
    setSelectedPlatforms((prev) => prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]);
  }

  async function runSearch() {
    if (!selectedConfigs.length) {
      setNotice("Select at least one social platform.");
      return;
    }

    setLoading(true);
    setNotice(`Searching ${selectedConfigs.map((item) => item.label).join(", ")} separately through Brave...`);

    try {
      const responses = await Promise.all(selectedConfigs.map(async (platform) => {
        const platformQuery = `site:${platform.domain} ${query}`;
        const response = await fetch("/api/intent-finder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword: platformQuery, location, maxResults: maxResultsPerPlatform })
        });
        const payload = await response.json();
        return {
          platform: platform.label,
          provider: payload.provider ?? "unknown",
          results: (payload.results ?? []) as SearchPreview[],
          errors: (payload.errors ?? []) as string[]
        };
      }));

      const combined = responses.flatMap((response) => response.results).filter(keepResult);
      const deduped = Array.from(new Map(combined.map((item) => [item.link, item])).values());
      deduped.sort((a, b) => a.title.localeCompare(b.title));
      setResults(deduped);

      const breakdown = responses.map((response) => `${response.platform}: ${response.results.filter(keepResult).length}`).join(" · ");
      const providers = Array.from(new Set(responses.map((response) => response.provider))).join(", ");
      const errors = responses.flatMap((response) => response.errors);
      setNotice(`${deduped.length} public social result${deduped.length === 1 ? "" : "s"} found. ${breakdown}. Provider: ${providers}.${errors.length ? ` Notes: ${errors.slice(0, 2).join(" | ")}` : ""}`);
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
          Search each selected platform separately for public posts where people are shopping for ABA software, asking for alternatives, or describing EMR problems. Private profiles and private groups are not accessed.
        </p>

        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">Platforms</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <button
                  key={platform.key}
                  type="button"
                  onClick={() => togglePlatform(platform.key)}
                  className={`rounded-full border px-4 py-2 text-xs font-black ${selectedPlatforms.includes(platform.key) ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700"}`}
                >
                  {platform.label}
                </button>
              ))}
            </div>
          </div>

          <label className="space-y-2 block">
            <span className="label">EMR shopping / complaint query</span>
            <textarea className="input min-h-32" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">Quick presets</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {presets.map((preset, index) => (
                <button key={preset} type="button" onClick={() => setQuery(preset)} className="badge bg-slate-50 hover:bg-cyan-50">
                  Shopping preset {index + 1}
                </button>
              ))}
            </div>
          </div>

          <label className="space-y-2 block">
            <span className="label">Location filter</span>
            <input className="input" value={location} onChange={(event) => setLocation(event.target.value)} />
          </label>

          <label className="space-y-2 block">
            <span className="label">Maximum results per platform</span>
            <EditableNumberInput className="input" min={1} max={20} value={maxResultsPerPlatform} onChange={setMaxResultsPerPlatform} />
          </label>

          <button type="button" onClick={runSearch} disabled={loading} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-50">
            {loading ? "Searching platforms..." : "Find Facebook + LinkedIn leads"}
          </button>
        </div>

        <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Public indexed sources only. Facebook and LinkedIn may hide private posts from search engines. Open every source and confirm context manually before outreach.
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
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Run a search to find public Facebook and LinkedIn EMR-shopping sources.</div>
          )}
        </div>
      </section>
    </div>
  );
}
