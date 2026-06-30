"use client";

import { useEffect, useMemo, useState } from "react";
import { MetricCard } from "@/components/ui/MetricCard";

type TopItem = { label: string; value: number };
type RecentVisitor = {
  time: string;
  visitor: string;
  session: string;
  path: string;
  title: string;
  referrer: string;
  device: string;
  location: string;
};

type AnalyticsSummary = {
  totals: {
    visitors: number;
    sessions: number;
    pageViews: number;
    activeNow: number;
    todayViews: number;
    avgTimeOnPageSeconds: number;
  };
  topPages: TopItem[];
  topReferrers: TopItem[];
  devices: TopItem[];
  locations: TopItem[];
  recentVisitors: RecentVisitor[];
  eventCount: number;
  durationSamples: number;
};

type AnalyticsResponse = {
  source?: string;
  summary?: AnalyticsSummary;
  notice?: string;
  error?: string;
};

const emptySummary: AnalyticsSummary = {
  totals: {
    visitors: 0,
    sessions: 0,
    pageViews: 0,
    activeNow: 0,
    todayViews: 0,
    avgTimeOnPageSeconds: 0
  },
  topPages: [],
  topReferrers: [],
  devices: [],
  locations: [],
  recentVisitors: [],
  eventCount: 0,
  durationSamples: 0
};

function formatDuration(seconds: number) {
  if (!seconds) return "0s";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s`;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function exportCsv(summary: AnalyticsSummary) {
  const headers = ["Time", "Visitor", "Session", "Page", "Title", "Referrer", "Device", "Location"];
  const rows = summary.recentVisitors.map((visitor) => [visitor.time, visitor.visitor, visitor.session, visitor.path, visitor.title, visitor.referrer, visitor.device, visitor.location]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => {
      const text = String(cell ?? "");
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    }).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "recovery-radar-website-traffic.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function TrafficAnalyticsDashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary>(emptySummary);
  const [notice, setNotice] = useState("Loading website traffic...");
  const [source, setSource] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const metrics = useMemo(() => [
    { label: "Unique visitors", value: summary.totals.visitors, delta: "public site" },
    { label: "Sessions", value: summary.totals.sessions, delta: "browser visits" },
    { label: "Page views", value: summary.totals.pageViews, delta: `${summary.totals.todayViews} today` },
    { label: "Active now", value: summary.totals.activeNow, delta: "last 5 min" },
    { label: "Avg time/page", value: formatDuration(summary.totals.avgTimeOnPageSeconds), delta: `${summary.durationSamples} samples` },
    { label: "Tracked events", value: summary.eventCount, delta: "views + duration" }
  ], [summary]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const response = await fetch("/api/analytics", { cache: "no-store" });
      const data = (await response.json()) as AnalyticsResponse;
      if (!response.ok) throw new Error(data.error ?? "Failed to load analytics");
      setSummary(data.summary ?? emptySummary);
      setNotice(data.notice ?? "Website traffic loaded.");
      setSource(data.source ?? "");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Failed to load analytics");
      setSummary(emptySummary);
      setSource("fetch_error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
    const timer = window.setInterval(loadAnalytics, 60000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => <MetricCard key={metric.label} label={metric.label} value={metric.value} delta={metric.delta} />)}
      </div>

      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-950">Website traffic command center</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Tracks anonymous public website visits, sessions, page views, referrers, devices, approximate location headers, and time on page. It will not show a real person’s name unless they identify themselves through a form, login, email click, or CRM lead capture.
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={loadAnalytics} disabled={loading} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 disabled:opacity-60">{loading ? "Refreshing..." : "Refresh"}</button>
            <button type="button" onClick={() => exportCsv(summary)} disabled={!summary.recentVisitors.length} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-60">Export CSV</button>
          </div>
        </div>
        {(() => {
          // Self-diagnosing status banner. The same notice box used to look
          // identical whether things were healthy, misconfigured, or broken,
          // which made "all zeros" confusing. Key it off the API's source so it
          // names the cause AND the exact fix. (Storage is already durable via
          // Prisma; zeros are almost always a missing env var or an empty DB.)
          const noData = summary.totals.pageViews === 0 && summary.eventCount === 0;
          let tone = "bg-blue-50 text-blue-950 border-blue-200";
          let fix = "";
          if (source === "no_database") {
            tone = "bg-amber-50 text-amber-950 border-amber-200";
            fix = "Fix: set DATABASE_URL in your Vercel project's Environment Variables (Production), then redeploy. Nothing can be stored until it is set.";
          } else if (source === "database_error" || source === "fetch_error") {
            tone = "bg-rose-50 text-rose-950 border-rose-200";
            fix = "Fix: the database is configured but the query failed. Check the DATABASE_URL connection string and confirm the database migrations have run in production (prisma migrate deploy).";
          } else if (source === "database" && noData) {
            tone = "bg-slate-50 text-slate-700 border-slate-200";
            fix = "Database is connected and ready, but no public visits are recorded yet. Open the public homepage in a private window to log a test visit, then Refresh.";
          }
          return (
            <div className={`mt-6 rounded-3xl border p-4 text-sm leading-6 ${tone}`}>
              <span className="font-black">{notice}</span>
              {fix ? <span className="mt-1 block font-semibold">{fix}</span> : null}
            </div>
          );
        })()}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card">
          <h3 className="text-xl font-black text-slate-950">Top pages</h3>
          <div className="mt-5 space-y-3">
            {summary.topPages.length ? summary.topPages.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                <span className="truncate text-sm font-bold text-slate-700">{item.label}</span>
                <span className="badge bg-slate-50">{item.value}</span>
              </div>
            )) : <p className="text-sm text-slate-500">No page views yet.</p>}
          </div>
        </section>

        <section className="card">
          <h3 className="text-xl font-black text-slate-950">Traffic sources</h3>
          <div className="mt-5 space-y-3">
            {summary.topReferrers.length ? summary.topReferrers.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                <span className="truncate text-sm font-bold text-slate-700">{item.label}</span>
                <span className="badge bg-slate-50">{item.value}</span>
              </div>
            )) : <p className="text-sm text-slate-500">No referrers yet.</p>}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card">
          <h3 className="text-xl font-black text-slate-950">Devices</h3>
          <div className="mt-5 flex flex-wrap gap-2">
            {summary.devices.length ? summary.devices.map((item) => <span key={item.label} className="badge bg-slate-50">{item.label}: {item.value}</span>) : <span className="text-sm text-slate-500">No device data yet.</span>}
          </div>
        </section>

        <section className="card">
          <h3 className="text-xl font-black text-slate-950">Approximate locations</h3>
          <div className="mt-5 flex flex-wrap gap-2">
            {summary.locations.length ? summary.locations.map((item) => <span key={item.label} className="badge bg-slate-50">{item.label}: {item.value}</span>) : <span className="text-sm text-slate-500">No location headers yet.</span>}
          </div>
        </section>
      </div>

      <section className="card min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Recent anonymous visitors</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Latest page views</h2>
          </div>
          <span className="badge">{summary.recentVisitors.length} rows</span>
        </div>
        <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200">
          <table className="min-w-[1100px] w-full divide-y divide-slate-200 bg-white text-sm">
            <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Visitor</th>
                <th className="px-4 py-3">Page</th>
                <th className="px-4 py-3">Referrer</th>
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.recentVisitors.map((visitor, index) => (
                <tr key={`${visitor.session}-${visitor.path}-${index}`}>
                  <td className="px-4 py-4 align-top text-slate-600">{formatTime(visitor.time)}</td>
                  <td className="px-4 py-4 align-top"><span className="badge bg-slate-50">{visitor.visitor}</span></td>
                  <td className="px-4 py-4 align-top"><p className="font-black text-slate-950">{visitor.path}</p><p className="mt-1 text-xs text-slate-500">{visitor.title}</p></td>
                  <td className="px-4 py-4 align-top text-slate-700">{visitor.referrer}</td>
                  <td className="px-4 py-4 align-top text-slate-700">{visitor.device}</td>
                  <td className="px-4 py-4 align-top text-slate-700">{visitor.location}</td>
                </tr>
              ))}
              {!summary.recentVisitors.length ? <tr><td colSpan={6} className="px-4 py-16 text-center text-slate-500">No public visits recorded yet. Deploy the tracker and visit the public homepage to test.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
