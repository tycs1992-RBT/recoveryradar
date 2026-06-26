import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOwnerRadarData } from "@/lib/owner-demo-data";
import { Panel, DonutRing, AreaTrend, StatBars, StatusDot, Pill, statusTone } from "@/components/owner/radar-ui";

export const metadata = { title: "Recovery Radar — Staff Pulse" };

export default async function StaffPulsePage() {
  const session = await getServerSession(authOptions);
  const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
  const d = getOwnerRadarData(tenantId);
  const p = d.staffPulse;
  const remaining = p.recoveredHoursBudget;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.35em] text-violet-300">Retention early-warning</p>
        <h1 className="mt-2 text-5xl font-black tracking-tight text-white">Staff Pulse</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-400">
          An anonymous read on how your team is doing — so you can act before burnout turns into turnover. When a site goes red, fund a play from the hours you&rsquo;ve already recovered, then watch the pulse move.
        </p>
      </div>

      <div className="rounded-2xl border border-violet-400/20 bg-violet-400/[0.06] px-5 py-4 text-sm leading-6 text-violet-100/90">
        <span className="font-black text-violet-200">Anonymous by design.</span> You see clinic and site averages only — never an individual&rsquo;s reading. Identifying who said what is reserved for the BCBA or scheduler admin directly assigned to that staff member, inside Infinite Suite OS. Staff Pulse is for supporting your team, not surveilling it.
      </div>

      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <Panel className="flex flex-col items-center justify-center gap-3 lg:w-72">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Clinic wellbeing</p>
          <DonutRing value={p.clinicScore} tone={statusTone[p.status]} label={p.status} />
          <p className="text-center text-xs font-semibold text-slate-400">averaged across all staff, this week</p>
        </Panel>
        <Panel eyebrow="Last 4 weeks" title="Clinic wellbeing trend">
          <AreaTrend
            labels={p.weeklyScores.map((w) => w.weekLabel)}
            primary={p.weeklyScores.map((w) => w.score)}
            secondary={p.weeklyScores.map(() => 70)}
            primaryLabel="Wellbeing score"
            secondaryLabel="Target (70)"
          />
        </Panel>
      </div>

      <Panel eyebrow="Site averages — no names" title="Which sites need support">
        <StatBars
          rows={[...p.bySite].sort((a, b) => a.score - b.score).map((s) => ({
            label: s.site,
            sub: `${s.staffCount} staff · ${s.status}`,
            value: s.score,
            tone: statusTone[s.status],
            trailing: `${s.score}`,
            trend: s.trend
          }))}
        />
        <p className="mt-4 text-xs font-semibold text-slate-500">Lowest first. Site score is an average of that site&rsquo;s anonymous staff readings — a site is never shown if too few staff would make it identifiable.</p>
      </Panel>

      <Panel eyebrow="Anonymized themes" title="What's driving the numbers">
        <div className="grid gap-3 sm:grid-cols-2">
          {p.themes.map((t) => (
            <div key={t.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="flex items-center gap-2">
                <StatusDot status={t.sentiment === "positive" ? "green" : "amber"} />
                <span className="text-sm font-bold text-slate-200">{t.label}</span>
              </div>
              <Pill tone={t.sentiment === "positive" ? "emerald" : "amber"}>{t.mentions} mentions</Pill>
            </div>
          ))}
        </div>
      </Panel>

      <Panel eyebrow="Funded by recovered hours — not your budget" title="Plays you can run when a site is red">
        <div className="mb-5 flex flex-wrap items-center gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-5 py-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wide text-emerald-300">Recovered-hours budget available</p>
            <p className="text-3xl font-black text-white">${remaining.toLocaleString()}</p>
          </div>
          <p className="max-w-md text-xs font-semibold leading-5 text-emerald-100/80">
            This is money Infinite Suite OS recovered from sessions that would otherwise have been lost — reinvest it in your team and watch the pulse climb. The recovery pool pays for retention.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {p.interventions.map((iv) => (
            <div key={iv.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-black text-white">{iv.title}</h3>
                <Pill tone="cyan">{iv.lever}</Pill>
              </div>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">{iv.detail}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wide text-slate-400">Est. cost</span>
                <span className="text-lg font-black text-emerald-300">${iv.estCost.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs font-semibold text-slate-500">Suggested plays only — you control which variables to pull and the spend stays within the recovered-hours budget. Costs are estimates pending review.</p>
      </Panel>
    </div>
  );
}
