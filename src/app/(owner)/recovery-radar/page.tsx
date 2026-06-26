import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOwnerRadarData } from "@/lib/owner-demo-data";
import { Panel, MetricCard, DonutRing, AreaTrend, StatusDot } from "@/components/owner/radar-ui";

export const metadata = { title: "Recovery Radar — Overview" };

export default async function RadarOverviewPage() {
  const session = await getServerSession(authOptions);
  const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
  const d = getOwnerRadarData(tenantId);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.35em] text-cyan-400">{d.periodLabel}</p>
        <h1 className="mt-2 text-5xl font-black tracking-tight text-white">How much are you recovering?</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
          Recovery Radar watches how your Recovery Waterfall™ is performing — turning cancellations and callouts into recovered, supported, review-ready hours, beside your current EMR.
        </p>
      </div>

      {/* Hero: gauge + headline metric cards */}
      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <Panel className="flex flex-col items-center justify-center gap-3 lg:w-72">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Recovery rate</p>
          <DonutRing value={d.recoveryRate} tone="emerald" label="recovered" />
          <p className="text-center text-xs font-semibold text-slate-400">{d.sessionsRecovered} of {d.sessionsAtRisk} at-risk sessions recovered</p>
        </Panel>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Hours recovered" value={`${d.hoursRecovered}`} sub="vs. 30 days ago" series={d.metricSeries.hoursRecovered} tone="cyan" />
          <MetricCard label="Est. value recovered" value={`$${(d.estimatedDollarsRecovered / 1000).toFixed(1)}k`} sub="estimate — review" series={d.metricSeries.estimatedDollarsRecovered} tone="violet" />
          <MetricCard label="Sessions at risk" value={`${d.sessionsAtRisk}`} sub="cancellations + callouts" series={d.metricSeries.sessionsAtRisk} tone="amber" invertDelta />
          <div className="sm:col-span-3">
            <MetricCard label="Recovery rate trend" value={`${d.recoveryRate}%`} sub="climbing week over week" series={d.metricSeries.recoveryRate} tone="emerald" />
          </div>
        </div>
      </div>

      {/* Weekly trend area chart */}
      <Panel eyebrow="Last 4 weeks" title="Recovered vs. at-risk by week">
        <AreaTrend
          labels={d.weeklyTrend.map((w) => w.weekLabel)}
          primary={d.weeklyTrend.map((w) => w.recovered)}
          secondary={d.weeklyTrend.map((w) => w.atRisk)}
          primaryLabel="Recovered"
          secondaryLabel="At risk"
        />
      </Panel>

      {/* Quick status row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Panel className="flex items-center gap-3">
          <StatusDot status={d.staffPulse.status} />
          <div>
            <p className="text-sm font-black text-white">Staff Pulse {d.staffPulse.clinicScore}</p>
            <p className="text-xs text-slate-400">clinic wellbeing — anonymous</p>
          </div>
        </Panel>
        <Panel className="flex items-center gap-3">
          <StatusDot status={d.bySite.some((s) => s.recoveryRate < 55) ? "red" : "amber"} />
          <div>
            <p className="text-sm font-black text-white">{d.bySite.filter((s) => s.recoveryRate < 55).length} sites need attention</p>
            <p className="text-xs text-slate-400">recovery below target</p>
          </div>
        </Panel>
        <Panel className="flex items-center gap-3">
          <StatusDot status={d.alerts.some((a) => a.severity === "high") ? "red" : "green"} />
          <div>
            <p className="text-sm font-black text-white">{d.alerts.length} active alerts</p>
            <p className="text-xs text-slate-400">recommendations to review</p>
          </div>
        </Panel>
      </div>

      <p className="text-xs font-semibold leading-5 text-slate-500">
        Recovery Radar recommends and reports; your team decides and documents. It never auto-bills and is never the clinical or billing system of record. Dollar figures are operational estimates pending your review.
      </p>
    </div>
  );
}
