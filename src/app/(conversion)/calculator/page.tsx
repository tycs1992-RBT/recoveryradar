import Link from "next/link";
import { LostHoursCalculator } from "@/components/calculator/LostHoursCalculator";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Lost Hours Calculator"
          title="Before you switch EMRs, calculate your lost-hours baseline."
          description="See how much your clinic is losing right now to unrecovered hours — cancellations, RBT callouts, no-shows, and documentation cleanup. Every number is one you already know. No software claims here; this is just the bleed."
        >
          <Link href="/quiz" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800">Take quiz</Link>
          <Link href="/provider-portal" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">Tour Provider Portal</Link>
        </PageHeader>

        <section className="mb-8 rounded-3xl border border-cyan-100 bg-cyan-50 p-6">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-700">Why calculate first?</p>
          <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-950">That&apos;s what you&apos;re losing. Now see how much you could recover.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">Use clinic-level numbers only. No patient names, diagnoses, insurance IDs, treatment notes or PHI. The report is an operational estimate and should be reviewed by your team.</p>
            </div>
            <div className="rounded-2xl bg-white p-4 text-sm font-semibold leading-6 text-slate-700">
              <p className="font-black text-slate-950">The wedge:</p>
              <p className="mt-2">This calculator only measures the bleed. The <Link href="/roi-simulator" className="font-black text-cyan-700 underline">Recovery ROI Simulator</Link> shows how much of it an Infinite Pieces recovery layer could put back.</p>
            </div>
          </div>
        </section>

        <LostHoursCalculator />
      </main>
    </div>
  );
}
