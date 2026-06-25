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

type CalendarItem = { day: number; type: string; title: string; keyword: string; owner: string; status: string; cta: string };
type LocalSeo = { location: string; keyword: string; slug: string; title: string; h1: string; angle: string };
type Competitor = { competitor: string; keyword: string; pageIdea: string; angle: string; risk: string; cta: string };
type LeadBridge = { leadQuery: string; matchingKeywords: string[]; outreachAngle: string; landingPage: string };

type Analysis = {
  notice?: string;
  opportunities: Opportunity[];
  pageMap: PageMap[];
  calendar: CalendarItem[];
  localSeo: LocalSeo[];
  competitors: Competitor[];
  leadBridge: LeadBridge[];
};

type SerpResult = {
  results?: Array<{ title?: string; link?: string; snippet?: string }>;
  notice?: string;
  error?: string;
};

type WebsiteAuditResult = {
  url?: string;
  title?: string;
  metaDescription?: string;
  h1?: string[];
  h2?: string[];
  checks?: Array<{ label: string; passed: boolean; detail: string }>;
  recommendations?: string[];
  error?: string;
};

type SearchConsoleResult = {
  opportunities?: Array<{ query: string; clicks?: number; impressions?: number; ctr?: number; position?: number; recommendation?: string }>;
  notice?: string;
  error?: string;
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

type Tab = (typeof tabs)[number];

const seedNiches = ["ABA clinic software", "ABA scheduling software", "CentralReach alternative", "ABA cancellation management", "how to open an ABA clinic", "custom cabinet maker", "bulk phone buyers"];

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function downloadCsv(filename: string, headers: string[], rows: unknown[][]) {
  const csv = [headers.map(csvEscape).join(","), ...rows.map((row) => row.map(csvEscape).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function copyText(text: string) {
  void navigator.clipboard?.writeText(text);
}

export function SEOGrowthSuite() {
  const [activeTab, setActiveTab] = useState<Tab>("Import + Score");
  const [niche, setNiche] = useState("ABA clinic software");
  const [locationsText, setLocationsText] = useState("Florida\nNew Hampshire\nMassachusetts\nTexas\nCalifornia");
  const [csvText, setCsvText] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("Import a Google Keyword Planner CSV or generate seed keywords to build your SEO, ads, landing page, local SEO, and content roadmap.");
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [serpKeyword, setSerpKeyword] = useState("ABA scheduling software");
  const [serpResult, setSerpResult] = useState<SerpResult | null>(null);
  const [auditUrl, setAuditUrl] = useState("https://demo.infinitepieces.ai");
  const [auditKeyword, setAuditKeyword] = useState("ABA operational recovery");
  const [auditResult, setAuditResult] = useState<WebsiteAuditResult | null>(null);
  const [gscCsv, setGscCsv] = useState("");
  const [gscResult, setGscResult] = useState<SearchConsoleResult | null>(null);

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
      const data = (await response.json()) as Analysis & { error?: string };
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
    setCsvText(await file.text());
  }

  async function checkSerp() {
    setSerpResult({ notice: "Checking SERP..." });
    const response = await fetch("/api/serp-checker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: serpKeyword, num: 10 })
    });
    setSerpResult((await response.json()) as SerpResult);
  }

  async function auditWebsite() {
    setAuditResult({ recommendations: ["Running website audit..."] });
    const response = await fetch("/api/website-audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: auditUrl, targetKeyword: auditKeyword })
    });
    setAuditResult((await response.json()) as WebsiteAuditResult);
  }

  async function importSearchConsole() {
    const response = await fetch("/api/search-console/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv: gscCsv })
    });
    setGscResult((await response.json()) as SearchConsoleResult);
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
        <section className="card space-y-5">
          <h3 className="text-2xl font-black text-slate-950">SERP checker + content gaps</h3>
          <div className="flex flex-wrap gap-3">
            <input className="input max-w-xl" value={serpKeyword} onChange={(e) => setSerpKeyword(e.target.value)} />
            <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white" onClick={checkSerp}>Check SERP</button>
          </div>
          <ResultBox data={serpResult} />
        </section>
      )}

      {activeTab === "Keyword → Page Map" && <ListSection title="Keyword-to-page map" rows={analysis?.pageMap ?? []} />}
      {activeTab === "Content Calendar" && <ListSection title="30-day content calendar" rows={analysis?.calendar ?? []} />}
      {activeTab === "Local SEO" && <ListSection title="Local SEO page ideas" rows={analysis?.localSeo ?? []} />}
      {activeTab === "Competitor Radar" && <ListSection title="Competitor and alternative keyword radar" rows={analysis?.competitors ?? []} />}
      {activeTab === "Lead Bridge" && <ListSection title="Lead query to keyword bridge" rows={analysis?.leadBridge ?? []} />}

      {activeTab === "Website Audit" && (
        <section className="card space-y-5">
          <h3 className="text-2xl font-black text-slate-950">Website audit</h3>
          <div className="grid gap-3 lg:grid-cols-2">
            <input className="input" value={auditUrl} onChange={(e) => setAuditUrl(e.target.value)} />
            <input className="input" value={auditKeyword} onChange={(e) => setAuditKeyword(e.target.value)} />
          </div>
          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white" onClick={auditWebsite}>Audit website</button>
          <ResultBox data={auditResult} />
        </section>
      )}

      {activeTab === "Search Console" && (
        <section className="card space-y-5">
          <h3 className="text-2xl font-black text-slate-950">Search Console CSV import</h3>
          <textarea className="input min-h-44 font-mono text-xs" value={gscCsv} onChange={(e) => setGscCsv(e.target.value)} placeholder="Paste Search Console export CSV here" />
          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white" onClick={importSearchConsole}>Analyze Search Console CSV</button>
          <ResultBox data={gscResult} />
        </section>
      )}
    </div>
  );
}

function KeywordTable({ opportunities, onSelect }: { opportunities: Opportunity[]; onSelect: (keyword: string) => void }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200">
      <table className="min-w-[900px] w-full bg-white text-sm">
        <thead className="bg-slate-50 text-left text-xs font-black uppercase text-slate-500">
          <tr><th className="px-4 py-3">Keyword</th><th className="px-4 py-3">Intent</th><th className="px-4 py-3">Cluster</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Page</th><th className="px-4 py-3">Action</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {opportunities.map((item) => (
            <tr key={item.keyword}>
              <td className="px-4 py-3 font-black text-slate-950">{item.keyword}</td>
              <td className="px-4 py-3">{item.intent}</td>
              <td className="px-4 py-3">{item.cluster}</td>
              <td className="px-4 py-3">{item.priorityScore}</td>
              <td className="px-4 py-3">{item.recommendedPage}</td>
              <td className="px-4 py-3"><button className="font-black underline" onClick={() => onSelect(item.keyword)}>Build page</button></td>
            </tr>
          ))}
          {!opportunities.length && <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">Generate or import keywords first.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function PagePlan({ item }: { item: Opportunity }) {
  const plan = [
    `URL: ${item.recommendedPage}`,
    `Title: ${item.pageTitle}`,
    `H1: ${item.h1}`,
    `Meta: ${item.metaDescription}`,
    `CTA: ${item.cta}`,
    `Outline: ${item.outline.join(" | ")}`,
    `FAQ: ${item.faq.join(" | ")}`,
    `Internal links: ${item.internalLinks.join(", ")}`
  ].join("\n");

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{item.intent} · {item.cluster}</p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">{item.pageTitle}</h3>
        </div>
        <button className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black" onClick={() => copyText(plan)}>Copy plan</button>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-4"><p className="label">Recommended URL</p><p className="mt-1 font-black">{item.recommendedPage}</p></div>
        <div className="rounded-2xl bg-white p-4"><p className="label">Priority score</p><p className="mt-1 font-black">{item.priorityScore}</p></div>
        <div className="rounded-2xl bg-white p-4 lg:col-span-2"><p className="label">Meta description</p><p className="mt-1">{item.metaDescription}</p></div>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <TextList title="Outline" items={item.outline} />
        <TextList title="FAQ" items={item.faq} />
        <TextList title="Ad headlines" items={item.adHeadlines} />
        <TextList title="Internal links" items={item.internalLinks} />
      </div>
    </div>
  );
}

function TextList({ title, items }: { title: string; items: string[] }) {
  return <div className="rounded-2xl bg-white p-4"><p className="label">{title}</p><ul className="mt-2 space-y-1 text-sm text-slate-700">{items.map((item) => <li key={item}>• {item}</li>)}</ul></div>;
}

function ListSection({ title, rows }: { title: string; rows: Array<Record<string, unknown>> }) {
  return (
    <section className="card">
      <h3 className="text-2xl font-black text-slate-950">{title}</h3>
      <div className="mt-5 grid gap-3">
        {rows.map((row, index) => <pre key={index} className="overflow-x-auto rounded-2xl bg-slate-50 p-4 text-xs text-slate-700">{JSON.stringify(row, null, 2)}</pre>)}
        {!rows.length && <p className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500">Generate SEO data first.</p>}
      </div>
    </section>
  );
}

function ResultBox({ data }: { data: unknown }) {
  return <pre className="max-h-[520px] overflow-auto rounded-3xl bg-slate-950 p-5 text-xs leading-5 text-slate-100">{JSON.stringify(data ?? { message: "No results yet." }, null, 2)}</pre>;
}
