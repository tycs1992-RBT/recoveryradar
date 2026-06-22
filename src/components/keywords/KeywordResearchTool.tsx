"use client";

import { useMemo, useState } from "react";

type KeywordIdea = {
  keyword: string;
  cluster: string;
  intent: string;
  demandTier: string;
  commercialIntent: number;
  suggestedPage: string;
  contentAngle: string;
  googleSearchUrl: string;
  googleTrendsUrl: string;
  competitionResults?: string;
  topResultTitles?: string[];
  pageTitle?: string;
  pageH1?: string;
  metaDescription?: string;
  pageStatus?: "published" | "planned";
  pageBrief?: string;
  internalLinks?: string[];
  faqQuestions?: string[];
};

type PagePlan = {
  page: string;
  title: string;
  h1: string;
  metaDescription: string;
  keywords: string[];
  brief: string;
};

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function downloadKeywordCsv(rows: KeywordIdea[]) {
  const headers = ["Keyword", "Cluster", "Intent", "Demand Tier", "Commercial Intent", "Suggested Page", "Page Title", "Meta Description", "Competition Results", "Content Angle", "Google Search", "Google Trends"];
  const csv = [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => [row.keyword, row.cluster, row.intent, row.demandTier, row.commercialIntent, row.suggestedPage, row.pageTitle, row.metaDescription, row.competitionResults, row.contentAngle, row.googleSearchUrl, row.googleTrendsUrl].map(csvEscape).join(","))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "recovery-radar-keywords.csv";
  link.click();
  URL.revokeObjectURL(url);
}

const presets = [
  "ABA clinic software",
  "ABA cancellation management",
  "ABA scheduling software",
  "CentralReach alternative",
  "active learner pricing",
  "custom cabinet maker",
  "bulk phone sales"
];

function buildFallbackBrief(idea: KeywordIdea) {
  return [
    `URL: ${idea.suggestedPage}`,
    `Title: ${idea.pageTitle ?? idea.keyword}`,
    `H1: ${idea.pageH1 ?? idea.keyword}`,
    `Meta description: ${idea.metaDescription ?? idea.contentAngle}`,
    `Target keyword: ${idea.keyword}`,
    `Content angle: ${idea.contentAngle}`,
    "CTA: Calculate lost hours / Tour Provider Portal / Request Founding Clinic walkthrough",
    "Compliance: clinic-level information only; no PHI; human-reviewed outreach."
  ].join("\n");
}

export function KeywordResearchTool() {
  const [niche, setNiche] = useState("ABA clinic software");
  const [locationsText, setLocationsText] = useState("Florida\nNew Hampshire\nMassachusetts");
  const [checkCompetition, setCheckCompetition] = useState(false);
  const [ideas, setIdeas] = useState<KeywordIdea[]>([]);
  const [notice, setNotice] = useState("Generate keyword ideas, map each keyword to a publishable SEO page, then open/copy the page brief for Google-ready content.");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const filteredIdeas = useMemo(() => filter === "all" ? ideas : ideas.filter((idea) => idea.intent === filter || idea.cluster === filter), [ideas, filter]);
  const filters = useMemo(() => ["all", ...Array.from(new Set(ideas.flatMap((idea) => [idea.intent, idea.cluster])))], [ideas]);
  const pagePlans = useMemo<PagePlan[]>(() => {
    const grouped = new Map<string, KeywordIdea[]>();
    for (const idea of filteredIdeas) {
      const group = grouped.get(idea.suggestedPage) ?? [];
      group.push(idea);
      grouped.set(idea.suggestedPage, group);
    }
    return Array.from(grouped.entries()).map(([page, pageIdeas]) => {
      const first = pageIdeas[0];
      const brief = first.pageBrief ?? buildFallbackBrief(first);
      return {
        page,
        title: first.pageTitle ?? first.keyword,
        h1: first.pageH1 ?? first.keyword,
        metaDescription: first.metaDescription ?? first.contentAngle,
        keywords: pageIdeas.map((idea) => idea.keyword).slice(0, 10),
        brief
      };
    });
  }, [filteredIdeas]);

  async function copyText(text: string, success: string) {
    await navigator.clipboard.writeText(text);
    setNotice(success);
  }

  async function generate() {
    setLoading(true);
    setErrors([]);
    setNotice("Generating keyword map and SEO page plan...");
    try {
      const response = await fetch("/api/keyword-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche,
          locations: locationsText.split("\n").map((line) => line.trim()).filter(Boolean),
          goal: "all",
          checkCompetition
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Keyword research failed");
      setIdeas(data.ideas ?? []);
      setNotice(data.notice ?? "Keyword ideas generated and mapped to SEO pages.");
      setErrors(data.errors ?? []);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Keyword research failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="card keyword-control-panel">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">SEO / Ads Keyword Machine</p>
        <h2 className="mt-2 text-3xl font-black text-slate-950">Turn keywords into published SEO pages</h2>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Generate keyword clusters, map every phrase to a real Infinite Pieces page URL, copy the page brief, and use the published URL for Search Console indexing.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button key={preset} type="button" onClick={() => setNiche(preset)} className="badge hover:bg-slate-50">{preset}</button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_1.1fr]">
          <label className="block space-y-2">
            <span className="label">Business / product / niche</span>
            <input className="input" value={niche} onChange={(event) => setNiche(event.target.value)} />
          </label>
          <label className="block space-y-2">
            <span className="label">Markets / locations, one per line</span>
            <textarea className="input min-h-28" value={locationsText} onChange={(event) => setLocationsText(event.target.value)} />
          </label>
          <label className="flex min-h-28 items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-bold text-slate-700">
            <input type="checkbox" checked={checkCompetition} onChange={(event) => setCheckCompetition(event.target.checked)} />
            <span>Check Google result count proxy for first 20 keywords</span>
          </label>
        </div>

        <div className="mt-6 grid gap-3 sm:max-w-xl sm:grid-cols-2">
          <button type="button" onClick={generate} disabled={loading} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-60">
            {loading ? "Generating..." : "Generate keywords"}
          </button>
          <button type="button" disabled={!filteredIdeas.length} onClick={() => downloadKeywordCsv(filteredIdeas)} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60">
            Export CSV
          </button>
        </div>

        <div className="mt-6 rounded-3xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">{notice}</div>
        {errors.length > 0 && (
          <div className="mt-4 rounded-3xl bg-amber-50 p-4 text-xs leading-5 text-amber-900">
            <p className="font-black">Competition check notes</p>
            {errors.slice(0, 4).map((error) => <p key={error}>{error}</p>)}
          </div>
        )}
      </section>

      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">SEO Page Builder</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">{pagePlans.length} publishable page plan{pagePlans.length === 1 ? "" : "s"}</h2>
          </div>
          <LinkListButton plans={pagePlans} onCopy={(text) => copyText(text, "Copied SEO URL list for Search Console.")} />
        </div>
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {pagePlans.length ? pagePlans.map((plan) => (
            <article key={plan.page} className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Published URL</p>
                  <a href={plan.page} target="_blank" rel="noreferrer" className="mt-2 block text-lg font-black text-slate-950 underline">{plan.page}</a>
                </div>
                <span className="badge bg-emerald-50 text-emerald-700">Ready to index</span>
              </div>
              <h3 className="mt-4 text-xl font-black text-slate-950">{plan.h1}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{plan.metaDescription}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {plan.keywords.slice(0, 6).map((keyword) => <span key={keyword} className="badge bg-slate-50">{keyword}</span>)}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <a href={plan.page} target="_blank" rel="noreferrer" className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white">Open page</a>
                <button type="button" onClick={() => copyText(plan.brief, `Copied page brief for ${plan.page}.`)} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black text-slate-700">Copy page brief</button>
              </div>
            </article>
          )) : (
            <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 xl:col-span-2">
              Generate keywords to create page plans. The app will map keywords to real published URLs like /aba-clinic-software and /aba-cancellation-management.
            </div>
          )}
        </div>
      </section>

      <section className="card keyword-results-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Keyword map</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">{filteredIdeas.length} ideas</h2>
          </div>
          <select className="input w-auto min-w-48" value={filter} onChange={(event) => setFilter(event.target.value)}>
            {filters.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200">
          <table className="min-w-[1100px] w-full divide-y divide-slate-200 bg-white text-sm">
            <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Keyword</th>
                <th className="px-4 py-3">Cluster</th>
                <th className="px-4 py-3">Intent</th>
                <th className="px-4 py-3">Demand</th>
                <th className="px-4 py-3">Page</th>
                <th className="px-4 py-3">Links</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIdeas.map((idea) => (
                <tr key={idea.keyword}>
                  <td className="px-4 py-4 align-top">
                    <p className="font-black text-slate-950">{idea.keyword}</p>
                    <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">{idea.contentAngle}</p>
                    {idea.topResultTitles?.length ? <p className="mt-2 text-xs text-slate-400">Top: {idea.topResultTitles.join(" · ")}</p> : null}
                  </td>
                  <td className="px-4 py-4 align-top"><span className="badge">{idea.cluster}</span></td>
                  <td className="px-4 py-4 align-top capitalize">{idea.intent}</td>
                  <td className="px-4 py-4 align-top">
                    <p className="font-black text-slate-950">{idea.demandTier}</p>
                    <p className="text-xs text-slate-500">Intent {idea.commercialIntent}/100</p>
                    {idea.competitionResults && <p className="text-xs text-slate-500">SERP {idea.competitionResults}</p>}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <a href={idea.suggestedPage} target="_blank" rel="noreferrer" className="font-black text-slate-950 underline">{idea.suggestedPage}</a>
                    <p className="mt-1 max-w-xs text-xs text-slate-500">{idea.pageTitle}</p>
                  </td>
                  <td className="px-4 py-4 align-top space-x-3">
                    <a href={idea.googleSearchUrl} target="_blank" rel="noreferrer" className="font-bold underline">Google</a>
                    <a href={idea.googleTrendsUrl} target="_blank" rel="noreferrer" className="font-bold underline">Trends</a>
                  </td>
                </tr>
              ))}
              {!filteredIdeas.length && (
                <tr><td colSpan={6} className="px-4 py-16 text-center text-slate-500">Generate keywords to build your SEO/ad map.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function LinkListButton({ plans, onCopy }: { plans: PagePlan[]; onCopy: (text: string) => void }) {
  const text = plans.map((plan) => `https://www.infinitepieces.ai${plan.page}`).join("\n");
  return (
    <button
      type="button"
      disabled={!plans.length}
      onClick={() => onCopy(text)}
      className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-60"
    >
      Copy URL list
    </button>
  );
}
