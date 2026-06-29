import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOwnerRadarData } from "@/lib/owner-demo-data";
import { Panel, DonutRing, AreaTrend, FunnelBars, StatBars, statusTone } from "@/components/owner/radar-ui";

export const metadata = { title: "Recovery Radar — Hours & Utilization" };

export default async function UtilizationPage() {
  const session = await getServerSession(authOptions);
  const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
  const d = getOwnerRadarData(tenantId);
  const u = d.utilization;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.35em] text-cyan-300">Operational truth</p>
        <h1 className="mt-2 text-5xl font-black tracking-tight text-white">Hours &amp; Utilization</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-400">
          The hours that were approved, scheduled, delivered, lost, and made up — in one place. This is your read on whether the care a payer approved is actually reaching the child.
        </p>
      </div>

      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] px-5 py-4 text-sm leading-6 text-cyan-100/90">
        <span className="font-black text-cyan-200">Approved hours are coverage, not a quota.</span> Low utilization means approved kids aren&rsquo;t getting their approved care — a continuity and access problem to solve, not a number to inflate. Read this next to Outcomes, never instead of it.
      </div>

      {/* Utilization rings */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="flex flex-col items-center justify-center gap-3">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Authorization utilization</p>
          <DonutRing value={u.authUtilizationPct} tone={statusTone[u.status]} label={`${u.authUtilizationPct}%`} />
          <p className="text-center text-xs font-semibold text-slate-400">delivered authorized hours ÷ total authorized</p>
        </Panel>
        <Panel className="flex flex-col items-center justify-center gap-3">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Staff utilization</p>
          <DonutRing value={u.staffUtilizationPct} tone={u.staffUtilizationPct >= 80 && u.staffUtilizationPct <= 90 ? "emerald" : "amber"} label={`${u.staffUtilizationPct}%`} />
          <p className="text-center text-xs font-semibold text-slate-400">billable ÷ available — healthy band is ~85%</p>
        </Panel>
      </div>

      {/* Hours funnel */}
      <Panel eyebrow={d.periodLabel} title="From approved to delivered">
        <FunnelBars
          rows={[
            { label: "Authorized (allotted)", value: u.authorizedHours, share: 100 },
            { label: "Scheduled", value: u.scheduledHours, share: Math.round((u.scheduledHours / u.authorizedHours) * 100) },
            { label: "Delivered (rendered)", value: u.deliveredHours, share: Math.round((u.deliveredHours / u.authorizedHours) * 100) }
          ]}
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-wide text-rose-300">Lost to cancellations</p>
            <p className="text-2xl font-black text-white">{u.lostHours.toLocaleString()} hrs</p>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-wide text-emerald-300">Recovered (made up)</p>
            <p className="text-2xl font-black text-white">{u.recoveredHours.toLocaleString()} hrs</p>
          </div>
        </div>
      </Panel>

      {/* Trend */}
      <Panel eyebrow="Last 4 weeks" title="Utilization trend">
        <AreaTrend
          labels={u.weekly.map((w) => w.weekLabel)}
          primary={u.weekly.map((w) => w.authUtilPct)}
          secondary={u.weekly.map((w) => w.staffUtilPct)}
          primaryLabel="Authorization utilization"
          secondaryLabel="Staff utilization"
        />
      </Panel>

      {/* By site */}
      <Panel eyebrow="Lowest first — where approved care is slipping" title="Authorization utilization by site">
        <StatBars
          rows={[...u.bySite].sort((a, b) => a.authUtilPct - b.authUtilPct).map((s) => ({
            label: s.site,
            sub: `${s.deliveredHours.toLocaleString()} of ${s.authorizedHours.toLocaleString()} authorized hrs · staff ${s.staffUtilPct}%`,
            value: s.authUtilPct,
            tone: statusTone[s.status],
            trailing: `${s.authUtilPct}%`
          }))}
        />
        <p className="mt-4 text-xs font-semibold text-slate-500">A red site usually means a scheduling or staffing gap keeping approved hours from being delivered — start there.</p>
      </Panel>
    </div>
  );
}
