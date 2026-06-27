import Link from "next/link";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { PageHeader } from "@/components/ui/PageHeader";
import { RecoverySimulator } from "@/components/owner/RecoverySimulator";

export const metadata = {
  title: "What Recovery Is Worth | Infinite Suite OS™",
  description: "See what a recovery layer returns for a typical hybrid ABA clinic — recovered hours compounding over three years on published industry averages. Then see your own clinic's real recovery, live, inside Recovery Radar."
};

export default function RoiSimulatorPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="What recovery is worth"
          title="One recovered session, compounded over three years."
          description="This is the industry-average picture for a typical hybrid ABA clinic — recovered hours stacking up against what the platform costs. The numbers below aren't editable on purpose: they're the published-average story. Your clinic's actual recovery is tracked live, with your real data, inside Recovery Radar."
        >
          <Link href="/calculator" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800">First, size your losses</Link>
          <Link href="/login?callbackUrl=/recovery-radar" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">See your live Radar</Link>
        </PageHeader>

        {/* Locked proof: auto-plays once on scroll, then settles on the 3-year figure. No controls. */}
        <RecoverySimulator variant="public" locked />

        {/* Primary CTA — the public proof hands off to signup; the live Radar is the reward. */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-900 bg-slate-950 p-8 text-white">
          <div className="grid items-center gap-6 lg:grid-cols-[1.4fr_0.9fr]">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-cyan-400">That&apos;s the average. Yours is live.</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">See your clinic&apos;s real recovery in Recovery Radar.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                The chart above is the typical hybrid clinic on industry numbers. Inside Infinite Pieces, Recovery Radar
                tracks <span className="font-bold text-white">your</span> recovered hours and dollars as your team recovers
                sessions — rolled up by site and setting, no spreadsheets. Join the founding pilot to get your own Radar.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/login?callbackUrl=/recovery-radar" className="rounded-full bg-cyan-400 px-6 py-4 text-center text-sm font-black text-slate-950 hover:bg-cyan-300">
                Start with Infinite Pieces
              </Link>
              <Link href="/provider-portal" className="rounded-full border border-white/20 px-6 py-4 text-center text-sm font-black text-white hover:border-white/40">
                Tour the Provider OS first
              </Link>
            </div>
          </div>
        </section>

        {/* Funnel clarity + honesty */}
        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-6">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-700">Want your current losses first?</p>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">
              This page shows what recovery <em>returns</em>. The <Link href="/calculator" className="font-black text-cyan-700 underline">Lost Hours Calculator</Link> shows
              what you&apos;re <em>losing</em> right now across cancellations, callouts, documentation rework, and admin time — start there to size the problem, then come back here for the payback.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-500">Honest by design</p>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
              Recovered-dollar figures use published ABA industry averages as a starting point; they&apos;re an illustrative
              model, not a guarantee, and the retention effect is a labeled hypothesis. Every number becomes real — and yours — once you&apos;re running inside Recovery Radar.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
