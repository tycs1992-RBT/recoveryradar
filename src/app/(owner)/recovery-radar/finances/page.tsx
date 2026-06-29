import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOwnerRadarData } from "@/lib/owner-demo-data";
import { Panel, AreaTrend, StatBars, type Tone } from "@/components/owner/radar-ui";

export const metadata = { title: "Recovery Radar — Finances" };

function Stat({ label, value, sub, tone = "text-white" }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`text-2xl font-black ${tone}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs font-semibold text-slate-500">{sub}</p>}
    </div>
  );
}

const usd = (n: number) => `$${n.toLocaleString()}`;

export default async function FinancesPage() {
  const session = await getServerSession(authOptions);
  const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
  const d = getOwnerRadarData(tenantId);
  const f = d.finances;

  const arTone = (label: string): Tone =>
    label.startsWith("90") ? "rose" : label.startsWith("61") ? "amber" : label.startsWith("31") ? "cyan" : "emerald";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.35em] text-emerald-300">Where the money flows</p>
        <h1 className="mt-2 text-5xl font-black tracking-tight text-white">Finances</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-400">
          Billed vs. collected, what&rsquo;s aging, and what each delivered hour is actually worth — so you can see where money is flowing in, and where it&rsquo;s stuck.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] px-5 py-4 text-sm leading-6 text-amber-100/90">
        <span className="font-black text-amber-200">{f.source === "manual" ? "Entered figures." : "Live from billing."}</span>{" "}
        {f.source === "manual"
          ? "These numbers come from what you enter or upload each month — illustrative until you connect billing. Nothing here is invented or projected."
          : "Pulled from your connected billing system."}
      </div>

      {/* Headline */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Billed" value={usd(f.billed)} sub={f.periodLabel} />
        <Stat label="Collected" value={usd(f.collected)} sub={`${f.netCollectionRatePct}% net collection`} tone="text-emerald-300" />
        <Stat label="Revenue / billable hr" value={usd(f.revenuePerBillableHour)} sub="ties care to dollars" />
        <Stat label="Recovered hours $" value={usd(f.recoveredDollars)} sub={`${Math.round((f.recoveredDollars / f.collected) * 100)}% of collected`} tone="text-cyan-300" />
      </div>

      {/* Revenue cycle health */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Days in A/R" value={`${f.daysInAR}`} sub="target 30–40" tone={f.daysInAR <= 40 ? "text-emerald-300" : "text-amber-300"} />
        <Stat label="Days to bill" value={`${f.daysToBill}`} sub="target 1–3" tone={f.daysToBill <= 3 ? "text-emerald-300" : "text-amber-300"} />
        <Stat label="First-pass acceptance" value={`${f.firstPassAcceptancePct}%`} sub="target >95%" tone={f.firstPassAcceptancePct >= 95 ? "text-emerald-300" : "text-amber-300"} />
        <Stat label="Denial rate" value={`${f.denialRatePct}%`} sub="lower is better" tone={f.denialRatePct <= 5 ? "text-emerald-300" : "text-amber-300"} />
      </div>

      {/* Billed vs collected trend */}
      <Panel eyebrow="Last 4 months" title="Billed vs. collected">
        <AreaTrend
          labels={f.monthly.map((m) => m.monthLabel)}
          primary={f.monthly.map((m) => m.billed)}
          secondary={f.monthly.map((m) => m.collected)}
          primaryLabel="Billed"
          secondaryLabel="Collected"
        />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* A/R aging */}
        <Panel eyebrow="Older money is harder to collect" title="A/R aging">
          <StatBars
            rows={f.arBuckets.map((b) => ({ label: b.label, value: b.amount, tone: arTone(b.label), trailing: usd(b.amount) }))}
          />
          <p className="mt-4 text-xs font-semibold text-slate-500">Anything in 90+ usually needs escalation or a write-off review.</p>
        </Panel>

        {/* Payer mix */}
        <Panel eyebrow="Concentration risk" title="Payer mix">
          <StatBars
            rows={f.payerMix.map((p) => ({ label: p.payer, value: p.sharePct, tone: "cyan" as Tone, trailing: `${p.sharePct}%` }))}
          />
          <p className="mt-4 text-xs font-semibold text-slate-500">Heavy reliance on one payer is a risk — a single rate change moves your whole month.</p>
        </Panel>
      </div>

      {/* By site */}
      <Panel eyebrow="Lowest collection first" title="Money health by site">
        <StatBars
          rows={[...f.bySite].sort((a, b) => a.collectedPct - b.collectedPct).map((s) => ({
            label: s.site,
            sub: `${usd(s.revenuePerHour)}/hr`,
            value: s.collectedPct,
            tone: s.status === "red" ? "rose" : s.status === "amber" ? "amber" : "emerald",
            trailing: `${s.collectedPct}% collected`
          }))}
        />
      </Panel>
    </div>
  );
}
