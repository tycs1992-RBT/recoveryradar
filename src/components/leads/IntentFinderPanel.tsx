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

type RedditPost = {
  id: string;
  title: string;
  snippet: string;
  author: string;
  subreddit: string;
  permalink: string;
  score: number;
  comments: number;
  createdAt?: string | null;
  signal: string;
  query: string;
  nextStep: string;
};

const emrOnlyQuery = '("ABA clinic" OR "ABA therapy") (EMR OR EHR OR "practice management software" OR CentralReach OR Rethink OR Motivity OR Catalyst OR ATrack) (problem OR issues OR frustrated OR switching OR alternative OR replacement OR recommend OR "looking for" OR compare OR vs) -jobs -job -salary -hiring -indeed -ziprecruiter -glassdoor -career';

const redditDefaultQuery = '(ABA OR BCBA OR RBT OR autism) (EMR OR EHR OR CentralReach OR Rethink OR Motivity OR Catalyst OR ATrack OR "practice management software") (problem OR issue OR frustrated OR switching OR alternative OR replacement OR recommend OR "looking for" OR compare OR best)';

const emrSignalPresets = [
  '("ABA clinic" OR "ABA therapy") (CentralReach OR Rethink OR Motivity OR Catalyst OR ATrack) (problem OR issue OR frustrated OR switching OR alternative OR replacement) -jobs -salary -indeed -ziprecruiter -glassdoor',
  '("ABA clinic" OR "ABA therapy") ("best EMR" OR "EMR software" OR "practice management software") (recommend OR "looking for" OR compare OR vs) -jobs -salary -hiring',
  '("ABA clinic owner" OR "BCBA owner" OR "clinical director") (EMR OR CentralReach OR Rethink OR Motivity) (problem OR alternative OR switching) -jobs -salary',
  '("ABA software" OR "ABA EMR") (alternative OR replacement OR competitor OR compare OR reviews) -jobs -salary -course -training',
  '("CentralReach alternative" OR "RethinkBH alternative" OR "Motivity alternative" OR "Catalyst ABA alternative") -jobs -salary -hiring'
];

const redditPresetQueries = [
  'ABA CentralReach problem alternative recommend',
  'ABA Rethink Motivity Catalyst software alternative',
  'BCBA owner EMR software looking for recommend',
  'ABA clinic practice management software frustrated',
  'ABA data collection billing scheduling software compare'
];

const excludeTerms = ["job", "jobs", "salary", "hiring", "indeed", "ziprecruiter", "glassdoor", "career", "remote position", "employment", "available in"];
const emrTerms = ["emr", "ehr", "software", "centralreach", "rethink", "motivity", "catalyst", "atrack", "practice management", "billing software", "data collection"];
const shoppingPainTerms = ["problem", "issue", "frustrated", "switch", "switching", "alternative", "replacement", "recommend", "looking for", "compare", "comparison", " vs ", "reviews", "best", "shopping"];

function isEmrComplaintOrShopping(result: SearchPreview) {
  const text = `${result.title} ${result.snippet} ${result.query ?? ""}`.toLowerCase();
  if (excludeTerms.some((term) => text.includes(term))) return false;
  const hasEmrContext = emrTerms.some((term) => text.includes(term));
  const hasBuyerOrPain = shoppingPainTerms.some((term) => text.includes(term));
  return hasEmrContext && hasBuyerOrPain;
}

function onlyEmrLinks(results: SearchPreview[]) {
  const deduped = new Map<string, SearchPreview>();
  for (const result of results) {
    if (!result.link || result.link === "#") continue;
    if (!isEmrComplaintOrShopping(result)) continue;
    deduped.set(result.link, result);
  }
  return Array.from(deduped.values());
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function IntentFinderPanel() {
  const [keyword, setKeyword] = useState(emrOnlyQuery);
  const [redditQuery, setRedditQuery] = useState(redditDefaultQuery);
  const [redditSubreddits, setRedditSubreddits] = useState("all\nABA\nBehaviorAnalysis\nBCBA\nautism");
  const [location, setLocation] = useState("United States");
  const [groupName, setGroupName] = useState("Alternatives");
  const [maxResults, setMaxResults] = useState(5);
  const [results, setResults] = useState<SearchPreview[]>([]);
  const [redditPosts, setRedditPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [redditLoading, setRedditLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>("EMR complaint/shop mode is on. Use Reddit mode for real public Reddit user posts, or link mode for web result pages.");
  const [mode, setMode] = useState<"reddit" | "single" | "group">("reddit");

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
      const filtered = onlyEmrLinks(payload.results ?? []);
      setResults(filtered);
      setNotice(`${filtered.length} EMR complaint/shopping link${filtered.length === 1 ? "" : "s"} found. Non-EMR results and job-board noise were removed.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function runRedditSearch() {
    setRedditLoading(true);
    setNotice(null);
    try {
      const response = await fetch("/api/reddit-signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: redditQuery,
          subreddits: redditSubreddits.split("\n").map((line) => line.trim()).filter(Boolean),
          limit: maxResults,
          sort: "new",
          time: "year"
        })
      });
      const payload = await response.json();
      setRedditPosts(payload.posts ?? []);
      setNotice(payload.notice ?? `${payload.posts?.length ?? 0} Reddit posts found.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Reddit search failed");
    } finally {
      setRedditLoading(false);
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
      const filtered = onlyEmrLinks(payload.results ?? []);
      setResults(filtered);
      setNotice(`${filtered.length} EMR complaint/shopping link${filtered.length === 1 ? "" : "s"} found from the group crawl. Non-EMR results and job-board noise were removed.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Crawler failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="card">
        <h2 className="text-2xl font-black text-slate-950">Reddit + EMR complaint finder</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Use Reddit mode for real public Reddit user posts about ABA EMR/software shopping or complaints. Use link mode for public web pages. Job-board noise is removed.
        </p>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-2">
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => setMode("reddit")} className={`rounded-2xl px-4 py-3 text-sm font-black ${mode === "reddit" ? "bg-slate-950 text-white" : "bg-white text-slate-700"}`}>Reddit posts</button>
            <button type="button" onClick={() => setMode("group")} className={`rounded-2xl px-4 py-3 text-sm font-black ${mode === "group" ? "bg-slate-950 text-white" : "bg-white text-slate-700"}`}>Crawl EMR group</button>
            <button type="button" onClick={() => setMode("single")} className={`rounded-2xl px-4 py-3 text-sm font-black ${mode === "single" ? "bg-slate-950 text-white" : "bg-white text-slate-700"}`}>Single EMR query</button>
          </div>
        </div>

        {mode === "reddit" ? (
          <div className="mt-6 space-y-4">
            <label className="space-y-2 block">
              <span className="label">Reddit EMR / software shopping query</span>
              <textarea className="input min-h-28" value={redditQuery} onChange={(event) => setRedditQuery(event.target.value)} />
            </label>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Reddit-only presets</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {redditPresetQueries.map((preset, index) => (
                  <button key={preset} type="button" onClick={() => setRedditQuery(preset)} className="badge bg-slate-50 hover:bg-cyan-50">
                    Reddit preset {index + 1}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">These search real public Reddit posts through the Reddit API when REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET are configured.</p>
            </div>
            <label className="space-y-2 block">
              <span className="label">Subreddits, one per line</span>
              <textarea className="input min-h-24" value={redditSubreddits} onChange={(event) => setRedditSubreddits(event.target.value)} />
            </label>
            <label className="space-y-2 block">
              <span className="label">Max posts per subreddit</span>
              <EditableNumberInput className="input" min={1} max={25} value={maxResults} onChange={setMaxResults} />
            </label>
            <button type="button" onClick={runRedditSearch} disabled={redditLoading} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-50">
              {redditLoading ? "Searching Reddit..." : "Find real Reddit EMR posts"}
            </button>
          </div>
        ) : mode === "group" ? (
          <div className="mt-6 space-y-4">
            <label className="space-y-2 block"><span className="label">Keyword group</span><select className="input" value={groupName} onChange={(event) => setGroupName(event.target.value)}>{keywordGroups.map((group) => <option key={group.groupName} value={group.groupName}>{group.groupName}</option>)}</select></label>
            <label className="space-y-2 block"><span className="label">Location filter</span><input className="input" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="United States, Florida, Texas..." /></label>
            <label className="space-y-2 block"><span className="label">Max results per keyword</span><EditableNumberInput className="input" min={1} max={10} value={maxResults} onChange={setMaxResults} /></label>
            <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-black uppercase tracking-wide text-slate-400">Queries in this group</p><div className="mt-3 flex flex-wrap gap-2">{selectedGroup?.keywords.map((item) => <span key={item} className="badge bg-slate-50">{item}</span>)}</div></div>
            <button type="button" onClick={runGroupCrawl} disabled={loading} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-50">{loading ? "Finding EMR links..." : "Find EMR complaint/shop links"}</button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <label className="space-y-2 block"><span className="label">EMR complaint / shopping query</span><textarea className="input min-h-28" value={keyword} onChange={(event) => setKeyword(event.target.value)} /></label>
            <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-black uppercase tracking-wide text-slate-400">EMR-only presets</p><div className="mt-3 flex flex-wrap gap-2">{emrSignalPresets.map((preset, index) => <button key={preset} type="button" onClick={() => setKeyword(preset)} className="badge bg-slate-50 hover:bg-cyan-50">EMR preset {index + 1}</button>)}</div><p className="mt-3 text-xs leading-5 text-slate-500">Use these when you only want links from people shopping for ABA EMR/software or complaining about current systems.</p></div>
            <label className="space-y-2 block"><span className="label">Location filter</span><input className="input" value={location} onChange={(event) => setLocation(event.target.value)} /></label>
            <button type="button" onClick={runSearch} disabled={loading} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-50">{loading ? "Searching..." : "Find EMR complaint/shop links"}</button>
          </div>
        )}

        <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <strong>Strict rule:</strong> public posts and links only. Open each source manually. Do not auto-message users or store private details.
        </div>
      </section>

      <section className="card">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-slate-950">Real Reddit posts + EMR links</h2>
          <span className="badge">Manual review</span>
        </div>
        {notice ? <p className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">{notice}</p> : null}

        {redditPosts.length ? (
          <div className="mt-5 space-y-4">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Public Reddit user posts</p>
            {redditPosts.map((post) => (
              <article key={post.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge bg-orange-50 text-orange-800">Reddit post</span>
                  <span className="badge bg-slate-50">{post.subreddit}</span>
                  <span className="badge bg-slate-50">{post.author}</span>
                  <span className="badge bg-cyan-50 text-cyan-800">{post.signal}</span>
                </div>
                <p className="mt-3 font-black text-slate-950">{post.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{post.snippet}</p>
                <p className="mt-2 text-xs font-semibold text-slate-500">Score {post.score} · {post.comments} comments {formatDate(post.createdAt) ? `· ${formatDate(post.createdAt)}` : ""}</p>
                <a href={post.permalink} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-xs font-black text-slate-950 underline">Open Reddit thread</a>
              </article>
            ))}
          </div>
        ) : null}

        {results.length ? (
          <div className="mt-6 space-y-4">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Public web EMR links</p>
            {results.map((result, index) => (
              <article key={`${result.link}-${index}`} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center gap-2"><span className="badge bg-cyan-50 text-cyan-800">EMR/software signal</span>{result.leadTemperature ? <span className="badge bg-amber-50 text-amber-800">{result.leadTemperature}</span> : null}</div>
                <p className="mt-3 font-black text-slate-950">{result.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{result.snippet}</p>
                <a href={result.link} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-xs font-black text-slate-950 underline">Open EMR complaint/shop source</a>
              </article>
            ))}
          </div>
        ) : null}

        {!redditPosts.length && !results.length ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            Use Reddit posts mode to search real public Reddit threads, or EMR link mode to search public web pages.
          </div>
        ) : null}
      </section>
    </div>
  );
}
