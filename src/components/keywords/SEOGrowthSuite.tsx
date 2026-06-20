"use client";

import { useMemo, useState } from "react";

type Opportunity = {
  keyword: string;
  avgMonthlySearches?: number | null;
  competition?: string | null;
  lowTopOfPageBid?: number | null;
  highTopOfPageBid?: number | null;
  intent: string;
  cluster: string;
  priorityScore: number;
  recommendedPage: string;
  pageTitle: string;
  h1: string;
  metaDescription: string;
  faq: string[];
  outline: string[];
  cta: string;
  internalLinks: string[];
  adGroup: string;
  adHeadlines: string[];
  notes: string;
};

type PageMap = {
  slug: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  intent: string;
  title: string;
  h1: string;
  metaDescription: string;
  contentAngle: string;
  cta: string;
  priorityScore: number;
};

type Calendar = { day: number; type: string; title: string; keyword: string; owner: string; status: string; cta: string };
type LocalSeo = { location: string; keyword: string; slug: string; title: string; h1: string; angle: string };
type Competitor = { competitor: string; keyword: string; pageIdea: string; angle: string; risk: string; cta: string };
type LeadBridge = { leadQuery: string; matchingKeywords: string[]; outreachAngle: string; landingPage: string };

type Analysis = {
  notice?: string;
  opportunities: Opportunity[];
  pageMap: PageMap[];
  calendar: Calendar[];
  localSeo: LocalSeo[];
  competitors: Competitor[];
  leadBridge: LeadBridge[];
};

const tabs = [
  "Import + Score",
  "Page Builder",
  "SERP Checker",
  "Keyword → Page Map",
  "Content Calendar",
  "Local SEO",
  "Competitor Radar",
  "Lead Bridge",
  "Website Audit",
  "Search Console"
] as const;

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function downloadCsv(filename: string, headers: string[], rows: unknown[][]) {
  const csv = [headers.map(csvEscape).join(","), ...rows.map((row) => row.map(csvEscape).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function copyText(text: string) {
  navigator.clipboard?.writeText(text);
}

const seedNiches = ["ABA clinic software", "ABA scheduling software", "CentralReach alternative", "ABA cancellation management", "how to open an ABA clinic", "custom cabinet maker", "bulk phone buyers"];

export function SEOGrowthSuite() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Import + Score");
  const [niche, setNiche] = useState("ABA clinic software");
  const [locationsText, setLocationsText] = useState("Florida\nNew Hampshire\nMassachusetts\nTexas\nCalifornia");
  const [csvText, setCsvText] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("Import a Google Keyword Planner CSV or generate seed keywords to build your SEO, ads, landing page, local SEO, and content roadmap.");
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [serpKeyword, setSerpKeyword] = useState("ABA scheduling software");
  const [serpResult, setSerpResult] = useState<any>(null);
  const [auditUrl, setAuditUrl] = useState("https://demo.infinitepieces.ai");
  const [auditKeyword, setAuditKeyword] = useState("ABA operational recovery");
  const [auditResult, setAuditResult] = useState<any>(null);
  const [gscCsv, setGscCsv] = useState("");
  const [gscResult, setGscResult] = useState<any>(null);

  const selectedOpportunity = useMemo(() => {
    if (!analysis?.opportunities.length) return null;
    return analysis.opportunities.find((item) => item.keyword === selectedKeyword) ?? analysis.opportunities[0];
  }, [analysis, selectedKeyword]);

  async function runAnalysis(source: "seed" | "csv" = "seed") {
    setLoading(true);
    setNotice("Building SEO growth map...");
    try {
      const response = await fetch("/api/seo-suite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche,
          locations: locationsText.split("\n").map((line) => line.trim()).filter(Boolean),
          csv: source === "csv" ? csvText : ""
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "SEO analysis failed");
      setAnalysis(data);
      setSelectedKeyword(data.opportunities?.[0]?.keyword ?? "");
      setNotice(data.notice ?? "SEO growth map generated.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "SEO analysis failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleFile(file: File | null) {
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
  }

  async function checkSerp() {
    setSerpResult({ loading: true });
    const response = await fetch("/api/serp-checker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: serpKeyword, num: 10 })
    });
    const data = await response.json();
    setSerpResult(data);
  }

  async function auditWebsite() {
    setAuditResult({ loading: true });
    const response = await fetch("/api/website-audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: auditUrl, targetKeyword: auditKeyword })
    });
    const data = await response.json();
    setAuditResult(data);
  }

  async function importSearchConsole() {
    const response = await fetch("/api/search-console/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv: gscCsv })
    });
    const data = await response.json();
    setGscResult(data);
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Ultimate SEO Growth Suite</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Turn searched phrases into ranked pages, ads, and lead outreach</h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
              Import Google Keyword Planner CSVs, build page maps, audit your website, check SERPs, generate local SEO pages, create content calendars, and connect keyword intent to lead follow-up.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white" onClick={() => runAnalysis("seed")} disabled={loading}>{loading ? "Working..." : "Generate seed map"}</button>
            <button className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700" onClick={() => analysis && downloadJson("recovery-radar-seo-suite.json", analysis)} disabled={!analysis}>Export JSON</button>
          </div>
        </div>
        <div className="mt-5 rounded-3xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">{notice}</div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-black ${activeTab === tab ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>{tab}</button>
          ))}
        </div>
      </section>

      {activeTab === "Import + Score" && (
        <div className="grid gap-6 2xl:grid-cols-[minmax(520px,0.9fr)_minmax(0,1.1fr)]">
          <section className="card">
            <h3 className="text-2xl font-black text-slate-950">Keyword Planner CSV import</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Upload or paste Google Ads Keyword Planner CSV data. Expected fields can include Keyword, Avg. monthly searches, Competition, Competition index, and top-of-page bids.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {seedNiches.map((item) => <button key={item} onClick={() => setNiche(item)} className="badge hover:bg-slate-50">{item}</button>)}
            </div>
            <div className="mt-5 space-y-4">
              <label className="block space-y-2"><span className="label">Seed niche / business</span><input className="input" value={niche} onChange={(e) => setNiche(e.target.value)} /></label>
              <label className="block space-y-2"><span className="label">Locations, one per line</span><textarea className="input min-h-24" value={locationsText} onChange={(e) => setLocationsText(e.target.value)} /></label>
              <label className="block space-y-2"><span className="label">Upload Keyword Planner CSV</span><input type="file" accept=".csv,text/csv" className="input" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} /></label>
              <label className="block space-y-2"><span className="label">Or paste CSV</span><textarea className="input min-h-40 font-mono text-xs" value={csvText} onChange={(e) => setCsvText(e.target.value)} placeholder={'Keyword,Avg. monthly searches,Competition,Top of page bid (high range)\nABA scheduling software,100,Medium,12.50'} /></label>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white" onClick={() => runAnalysis("csv")} disabled={loading || !csvText.trim()}>Import CSV</button>
              <button className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700" onClick={() => runAnalysis("seed")} disabled={loading}>Use seed ideas</button>
            </div>
          </section>
          <section className="card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Priority list</p>
                <h3 className="mt-2 text-3xl font-black text-slate-950">{analysis?.opportunities.length ?? 0} keywords scored</h3>
              </div>
              <button className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black text-slate-700" disabled={!analysis} onClick={() => analysis && downloadCsv("keyword-priority-list.csv", ["Keyword", "Volume", "Competition", "Intent", "Cluster", "Priority", "Page", "Title"], analysis.opportunities.map((item) => [item.keyword, item.avgMonthlySearches ?? "", item.competition ?? "", item.intent, item.cluster, item.priorityScore, item.recommendedPage, item.pageTitle]))}>Export CSV</button>
            </div>
            <KeywordTable opportunities={analysis?.opportunities ?? []} onSelect={(keyword) => { setSelectedKeyword(keyword); setActiveTab("Page Builder"); }} />
          </section>
        </div>
      )}

      {activeTab === "Page Builder" && (
        <section className="card">
          <div className="grid gap-6 2xl:grid-cols-[minmax(460px,0.55fr)_minmax(0,0.95fr)]">
            <div>
              <h3 className="text-2xl font-black text-slate-950">SEO page builder</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">Choose a keyword and copy a page plan into your site backlog.</p>
              <select className="input mt-5" value={selectedKeyword} onChange={(e) => setSelectedKeyword(e.target.value)}>
                {(analysis?.opportunities ?? []).map((item) => <option key={item.keyword} value={item.keyword}>{item.keyword}</option>)}
              </select>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              {selectedOpportunity ? <PagePlan item={selectedOpportunity} /> : <p className="text-slate-500">Generate or import keywords first.</p>}
            </div>
          </div>
        </section>
      )}

      {activeTab === "SERP Checker" && (
        <section className="card">
          <h3 className="text-2xl font-black text-slate-950">SERP checker + content gaps</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">Checks top Google results through Custom Search when configured. Use this to see what Google already ranks and how your page can be different.</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row"><input className="input" value={serpKeyword} onChange={(e) => setSerpKeyword(e.target.value)} /><button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white" onClick={checkSerp}>Check SERP</button></div>
          {serpResult && <pre className="mt-5 max-h-[560px] overflow-auto rounded-3xl bg-slate-950 p-5 text-xs leading-6 text-slate-100">{JSON.stringify(serpResult, null, 2)}</pre>}
        </section>
      )}

      {activeTab === "Keyword → Page Map" && <PageMapView analysis={analysis} />}
      {activeTab === "Content Calendar" && <CalendarView calendar={analysis?.calendar ?? []} />}
      {activeTab === "Local SEO" && <LocalSeoView rows={analysis?.localSeo ?? []} />}
      {activeTab === "Competitor Radar" && <CompetitorView rows={analysis?.competitors ?? []} />}
      {activeTab === "Lead Bridge" && <LeadBridgeView rows={analysis?.leadBridge ?? []} />}

      {activeTab === "Website Audit" && (
        <section className="card">
          <h3 className="text-2xl font-black text-slate-950">Website audit</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">Scan your deployed page for title, meta description, headings, calculator CTAs, Provider Portal CTA, and no-migration language.</p>
          <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(260px,0.6fr)_auto]"><input className="input" value={auditUrl} onChange={(e) => setAuditUrl(e.target.value)} /><input className="input" value={auditKeyword} onChange={(e) => setAuditKeyword(e.target.value)} /><button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white" onClick={auditWebsite}>Audit</button></div>
          {auditResult && <pre className="mt-5 max-h-[560px] overflow-auto rounded-3xl bg-slate-950 p-5 text-xs leading-6 text-slate-100">{JSON.stringify(auditResult, null, 2)}</pre>}
        </section>
      )}

      {activeTab === "Search Console" && (
        <section className="card">
          <h3 className="text-2xl font-black text-slate-950">Search Console CSV import</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">After launch, export Search Console performance data and paste it here. Prioritize high-impression keywords with low CTR or positions 5-20.</p>
          <textarea className="input mt-5 min-h-48 font-mono text-xs" value={gscCsv} onChange={(e) => setGscCsv(e.target.value)} placeholder={'Query,Clicks,Impressions,CTR,Position\naba scheduling software,4,900,0.4%,12.3'} />
          <button className="mt-4 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white" onClick={importSearchConsole} disabled={!gscCsv.trim()}>Import Search Console CSV</button>
          {gscResult && <pre className="mt-5 max-h-[560px] overflow-auto rounded-3xl bg-slate-950 p-5 text-xs leading-6 text-slate-100">{JSON.stringify(gscResult, null, 2)}</pre>}
        </section>
      )}
    </div>
  );
}

function KeywordTable({ opportunities, onSelect }: { opportunities: Opportunity[]; onSelect: (keyword: string) => void }) {
  return <div className="mt-5 max-h-[620px] overflow-auto rounded-3xl border border-slate-200"><table className="min-w-[1100px] w-full bg-white text-sm"><thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500"><tr><th className="p-3">Keyword</th><th className="p-3">Intent</th><th className="p-3">Volume</th><th className="p-3">Competition</th><th className="p-3">Score</th><th className="p-3">Page</th><th className="p-3">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{opportunities.map((item) => <tr key={item.keyword}><td className="p-3 font-black text-slate-950">{item.keyword}<p className="font-normal text-slate-500">{item.cluster}</p></td><td className="p-3 capitalize">{item.intent}</td><td className="p-3">{item.avgMonthlySearches ?? "estimate"}</td><td className="p-3">{item.competition ?? "unknown"}</td><td className="p-3"><span className="rounded-full bg-emerald-100 px-3 py-1 font-black text-emerald-900">{item.priorityScore}</span></td><td className="p-3 font-semibold">{item.recommendedPage}</td><td className="p-3"><button className="font-black underline" onClick={() => onSelect(item.keyword)}>Build page</button></td></tr>)}{!opportunities.length && <tr><td className="p-8 text-center text-slate-500" colSpan={7}>Generate or import keywords first.</td></tr>}</tbody></table></div>;
}

function PagePlan({ item }: { item: Opportunity }) {
  const md = `# ${item.h1}\n\nSEO title: ${item.pageTitle}\nURL: ${item.recommendedPage}\nMeta: ${item.metaDescription}\n\n## Outline\n${item.outline.map((o) => `- ${o}`).join("\n")}\n\n## FAQs\n${item.faq.map((q) => `- ${q}`).join("\n")}\n\nCTA: ${item.cta}`;
  return <div className="space-y-5"><div className="flex justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wide text-slate-400">{item.keyword}</p><h3 className="mt-1 text-2xl font-black text-slate-950">{item.pageTitle}</h3></div><button className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black" onClick={() => copyText(md)}>Copy brief</button></div><dl className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-white p-4"><dt className="label">URL</dt><dd className="font-black">{item.recommendedPage}</dd></div><div className="rounded-2xl bg-white p-4"><dt className="label">Priority</dt><dd className="font-black">{item.priorityScore}/100</dd></div><div className="rounded-2xl bg-white p-4 sm:col-span-2"><dt className="label">Meta description</dt><dd>{item.metaDescription}</dd></div></dl><div><p className="label">Outline</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">{item.outline.map((o) => <li key={o}>{o}</li>)}</ul></div><div><p className="label">FAQ</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">{item.faq.map((q) => <li key={q}>{q}</li>)}</ul></div><div><p className="label">Ad headlines</p><div className="mt-2 flex flex-wrap gap-2">{item.adHeadlines.map((h) => <span className="badge" key={h}>{h}</span>)}</div></div></div>;
}

function PageMapView({ analysis }: { analysis: Analysis | null }) {
  const pageMap = analysis?.pageMap ?? [];
  return <section className="card"><div className="flex justify-between"><h3 className="text-2xl font-black text-slate-950">Keyword-to-page map</h3><button className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black" disabled={!pageMap.length} onClick={() => downloadCsv("keyword-page-map.csv", ["Slug", "Primary keyword", "Secondary keywords", "Intent", "Title", "H1", "Meta", "Score"], pageMap.map((p) => [p.slug, p.primaryKeyword, p.secondaryKeywords.join("; "), p.intent, p.title, p.h1, p.metaDescription, p.priorityScore]))}>Export CSV</button></div><div className="mt-5 grid gap-4">{pageMap.map((p) => <article key={p.slug} className="rounded-3xl border border-slate-200 p-4"><div className="flex flex-wrap justify-between gap-3"><h4 className="font-black text-slate-950">{p.slug}</h4><span className="badge">{p.priorityScore}/100</span></div><p className="mt-2 font-semibold">Primary: {p.primaryKeyword}</p><p className="mt-1 text-sm text-slate-600">Secondary: {p.secondaryKeywords.join(", ") || "None"}</p><p className="mt-2 text-sm text-slate-600">{p.metaDescription}</p></article>)}{!pageMap.length && <p className="text-slate-500">Generate keywords first.</p>}</div></section>;
}

function CalendarView({ calendar }: { calendar: Calendar[] }) {
  return <section className="card"><h3 className="text-2xl font-black text-slate-950">30-day content calendar</h3><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{calendar.map((item) => <article className="rounded-3xl border border-slate-200 p-4" key={`${item.day}-${item.keyword}`}><span className="badge">Day {item.day} · {item.type}</span><h4 className="mt-3 font-black text-slate-950">{item.title}</h4><p className="mt-2 text-sm text-slate-600">Keyword: {item.keyword}</p><p className="mt-2 text-xs text-slate-500">Owner: {item.owner} · Status: {item.status}</p></article>)}{!calendar.length && <p className="text-slate-500">Generate keywords first.</p>}</div></section>;
}

function LocalSeoView({ rows }: { rows: LocalSeo[] }) {
  return <section className="card"><h3 className="text-2xl font-black text-slate-950">Local SEO mode</h3><div className="mt-5 grid gap-3">{rows.slice(0, 60).map((row) => <article key={`${row.location}-${row.keyword}`} className="rounded-3xl border border-slate-200 p-4"><div className="flex flex-wrap gap-2"><span className="badge">{row.location}</span><span className="badge">{row.slug}</span></div><h4 className="mt-3 font-black text-slate-950">{row.title}</h4><p className="mt-2 text-sm text-slate-600">{row.angle}</p></article>)}{!rows.length && <p className="text-slate-500">Generate keywords first.</p>}</div></section>;
}

function CompetitorView({ rows }: { rows: Competitor[] }) {
  return <section className="card"><h3 className="text-2xl font-black text-slate-950">Competitor radar</h3><div className="mt-5 grid gap-4 md:grid-cols-2">{rows.map((row) => <article key={`${row.competitor}-${row.keyword}`} className="rounded-3xl border border-slate-200 p-4"><span className="badge">{row.competitor}</span><h4 className="mt-3 font-black text-slate-950">{row.keyword}</h4><p className="mt-2 text-sm text-slate-600">{row.angle}</p><p className="mt-2 text-xs font-bold text-amber-700">Guardrail: {row.risk}</p><p className="mt-2 text-sm font-black">CTA: {row.cta}</p></article>)}{!rows.length && <p className="text-slate-500">Generate keywords first.</p>}</div></section>;
}

function LeadBridgeView({ rows }: { rows: LeadBridge[] }) {
  return <section className="card"><h3 className="text-2xl font-black text-slate-950">Lead + keyword bridge</h3><p className="mt-3 text-sm text-slate-600">Use keywords to decide what landing page and outreach angle belongs with each lead query.</p><div className="mt-5 grid gap-4">{rows.map((row) => <article key={row.leadQuery} className="rounded-3xl border border-slate-200 p-4"><h4 className="font-black text-slate-950">{row.leadQuery}</h4><p className="mt-2 text-sm text-slate-600">{row.outreachAngle}</p><p className="mt-2 text-sm font-black">Landing page: {row.landingPage}</p><div className="mt-2 flex flex-wrap gap-2">{row.matchingKeywords.map((kw) => <span className="badge" key={kw}>{kw}</span>)}</div></article>)}{!rows.length && <p className="text-slate-500">Generate keywords first.</p>}</div></section>;
}
