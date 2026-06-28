import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOwnerRadarData } from "@/lib/owner-demo-data";
import { Panel, DonutRing, AreaTrend, StatBars, statusTone } from "@/components/owner/radar-ui";

export const metadata = { title: "Recovery Radar — Outcomes" };

// Simple tone ramp for a progress percentage.
const toneFor = (n: number): "emerald" | "amber" | "rose" => (n >= 75 ? "emerald" : n >= 60 ? "amber" : "rose");

export default async function OutcomesPage() {
  const session = await getServerSession(authOptions);
  const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
  const d = getOwnerRadarData(tenantId);
  const o = d.outcomes;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.35em] text-emerald-300">Outcomes, not just hours</p>
        <h1 className="mt-2 text-5xl font-black tracking-tight text-white">Outcomes</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-400">
          Recovering a cancelled session delivers care a child&rsquo;s plan <span className="font-bold text-slate-200">already authorized</span> — it never adds hours. This view answers the question that actually matters: are those recovered hours <span className="font-bold text-slate-200">producing progress</span>, or just getting billed?
        </p>
      </div>

      {/* Guardrail band — same discipline as Staff Pulse */}
      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-5 py-4 text-sm leading-6 text-emerald-100/90">
        <span className="font-black text-emerald-200">Aggregate by design.</span> Progress here is clinician-entered and rolled up to clinic, setting, and domain level — <span className="font-bold">never an individual child</span>. Infinite <span className="font-bold">displays</span> the progress your BCBAs record; it never sets, recommends, or optimizes a child&rsquo;s hours. The clinical plan is the BCBA&rsquo;s. Figures are illustrative demo data.
      </div>

      {/* Headline progress */}
      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <Panel className="flex flex-col items-center justify-center gap-3 lg:w-72">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Active goals on track</p>
          <DonutRing value={o.goalsOnTrackPct} tone={statusTone[o.status]} label={`${o.masteredThisPeriod} mastered`} />
          <p className="text-center text-xs font-semibold text-slate-400">progressing or mastered, this period</p>
        </Panel>
        <Panel eyebrow="Last 4 weeks" title="Goal-progress trend">
          <AreaTrend
            labels={o.weeklyProgress.map((w) => w.weekLabel)}
            primary={o.weeklyProgress.map((w) => w.onTrackPct)}
            secondary={o.weeklyProgress.map(() => 70)}
            primaryLabel="% of goals on track"
            secondaryLabel="70% benchmark"
          />
        </Panel>
      </div>

      {/* The point of the whole product: recovered (authorized) care → progress */}
      <Panel
        eyebrow="Recovered care → progress"
        title="Weeks you delivered more authorized care, goals kept moving"
      >
        <StatBars
          rows={o.recoveredVsProgress.map((w) => ({
            label: w.weekLabel,
            sub: `${w.recoveredSessions} authorized sessions recovered & delivered`,
            value: w.onTrackPct,
            tone: toneFor(w.onTrackPct),
            trailing: `${w.onTrackPct}% on track`,
            trend: "up" as const
          }))}
        />
        <p className="mt-4 text-xs leading-6 text-slate-500">
          Illustrative, aggregate, and correlational — not a clinical or causal claim. It shows whether the care you recovered is tracking with progress your clinicians record. Validated against your real data in the pilot.
        </p>
      </Panel>

      {/* By intervention domain */}
      <Panel eyebrow="By intervention domain" title="Where progress is strong — and where it isn't">
        <StatBars
          rows={o.byDomain.map((x) => ({
            label: x.domain,
            sub: `${x.goalsTracked} goals tracked`,
            value: x.onTrackPct,
            tone: toneFor(x.onTrackPct),
            trailing: `${x.onTrackPct}%`,
            trend: x.trend
          }))}
        />
        <p className="mt-4 text-xs leading-6 text-slate-500">
          School-readiness goals are trending down while communication leads — the kind of signal a clinical director can act on, set entirely from clinician-entered progress.
        </p>
      </Panel>

      {/* By setting — progress beside the share of recovered hours */}
      <Panel eyebrow="By setting" title="Progress, beside the share of recovered hours">
        <StatBars
          rows={o.bySetting.map((x) => ({
            label: x.setting,
            sub: `${x.recoveredHoursShare}% of recovered hours`,
            value: x.goalsOnTrackPct,
            tone: toneFor(x.goalsOnTrackPct),
            trailing: `${x.goalsOnTrackPct}% on track`
          }))}
        />
      </Panel>

      <p className="max-w-3xl text-sm leading-7 text-slate-500">
        The point isn&rsquo;t more hours — it&rsquo;s making sure the hours a child is <span className="font-bold text-slate-300">already approved for</span> actually happen, and that they&rsquo;re working. That&rsquo;s the difference between measuring success by hours billed and measuring it by outcomes earned.
      </p>
    </div>
  );
}
