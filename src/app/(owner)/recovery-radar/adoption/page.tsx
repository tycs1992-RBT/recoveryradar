import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOwnerRadarData } from "@/lib/owner-demo-data";
import { Panel, DonutRing, AreaTrend, StatBars, statusTone } from "@/components/owner/radar-ui";

export const metadata = { title: "Recovery Radar — Adoption & Usage" };

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs font-semibold text-slate-500">{sub}</p>}
    </div>
  );
}

export default async function AdoptionPage() {
  const session = await getServerSession(authOptions);
  const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
  const d = getOwnerRadarData(tenantId);
  const a = d.adoption;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.35em] text-cyan-300">Proof of use</p>
        <h1 className="mt-2 text-5xl font-black tracking-tight text-white">Adoption &amp; Usage</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-400">
          Hard proof your team is actually using what you&rsquo;re paying for — which tools get used most, who&rsquo;s logging in, and where adoption needs a nudge.
        </p>
      </div>

      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] px-5 py-4 text-sm leading-6 text-cyan-100/90">
        <span className="font-black text-cyan-200">Why this matters.</span> The software only pays off when staff use it. This is your receipt — and your early warning: a site with low adoption is the one where recovery and outcomes will slip next.
      </div>

      {/* Active + trend */}
      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <Panel className="flex flex-col items-center justify-center gap-3 lg:w-72">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Staff active this week</p>
          <DonutRing value={a.overallActivePct} tone={statusTone[a.status]} label={`${a.overallActivePct}%`} />
          <p className="text-center text-xs font-semibold text-slate-400">of licensed staff</p>
        </Panel>
        <Panel eyebrow="Last 4 weeks" title="Active users trend">
          <AreaTrend
            labels={a.weeklyActive.map((w) => w.weekLabel)}
            primary={a.weeklyActive.map((w) => w.pct)}
            secondary={a.weeklyActive.map(() => 80)}
            primaryLabel="Active %"
            secondaryLabel="Target (80%)"
          />
        </Panel>
      </div>

      {/* Proof-of-use stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Logins this period" value={a.loginsThisPeriod.toLocaleString()} />
        <Stat label="Sessions logged in-app" value={a.sessionsLoggedInApp.toLocaleString()} sub="documented through the suite" />
        <Stat label="Caregivers active" value={`${a.caregiverAppActivePct}%`} sub="using Care Pocket™" />
        <Stat label="Hours run through the system" value={a.hoursTouchedBySystem.toLocaleString()} sub="this period" />
      </div>

      {/* Which modules used most */}
      <Panel eyebrow="Most-used first" title="Which tools your team actually uses">
        <StatBars
          rows={[...a.byModule].sort((x, y) => y.usagePct - x.usagePct).map((m) => ({
            label: m.module,
            sub: `${m.weeklyActive.toLocaleString()} active weekly`,
            value: m.usagePct,
            tone: m.usagePct >= 75 ? "emerald" : m.usagePct >= 50 ? "cyan" : "amber",
            trailing: `${m.usagePct}%`,
            trend: m.trend
          }))}
        />
        <p className="mt-4 text-xs font-semibold text-slate-500">Low-usage tools aren&rsquo;t failing — they&rsquo;re the next training opportunity. A module climbing week over week means a habit is forming.</p>
      </Panel>

      {/* Adoption by site */}
      <Panel eyebrow="Lowest first — nudge these" title="Adoption by site">
        <StatBars
          rows={[...a.bySite].sort((x, y) => x.adoptionPct - y.adoptionPct).map((s) => ({
            label: s.site,
            value: s.adoptionPct,
            tone: statusTone[s.status],
            trailing: `${s.adoptionPct}%`
          }))}
        />
      </Panel>
    </div>
  );
}
