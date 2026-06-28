import Link from "next/link";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { offer } from "@/lib/pricing";

export const metadata = {
  title: "Founding Clinic Program — Pricing | Recovery Radar™",
  description:
    "Keep your EMR. Add Infinite Suite OS™ beside it to recover lost operational value. Founding Clinic Program — no migration, unlimited staff and caregiver seats, free pilot. Book a demo for a custom proposal.",
  robots: { index: true, follow: true }
};

export default function PricingPage() {
  const fp = offer.foundingProgram;
  const demoHref =
    "mailto:founders@infinitepieces.ai" +
    "?subject=" +
    encodeURIComponent("Demo request — Infinite Suite OS Founding Clinic Program") +
    "&body=" +
    encodeURIComponent(
      [
        "Hi Infinite Pieces team,",
        "",
        "We'd like a demo and a custom proposal for the Founding Clinic Program.",
        "",
        "Clinic name:",
        "Your name and role:",
        "Number of sites:",
        "Approx. active learners:",
        "Current EMR:",
        "Biggest operational pain (cancellations, callouts, late notes, etc.):",
        "",
        "Thanks!"
      ].join("\n")
    );

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#ffffff_0%,#f0fbff_48%,#fff8ea_100%)]">
          <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-cyan-700">{fp.eyebrow}</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">{fp.headline}</h1>
            <p className="mt-3 text-sm font-black uppercase tracking-[0.25em] text-slate-500">{fp.limited}</p>
            <p className="mt-6 max-w-3xl text-xl font-black leading-8 text-slate-900">{offer.positioning}</p>
            <p className="mt-4 max-w-3xl text-base font-semibold leading-8 text-slate-600">{fp.subhead}</p>
            <a
              href={demoHref}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-950 px-7 py-3.5 text-sm font-black text-white shadow-soft transition hover:bg-slate-800"
            >
              {fp.cta.label} →
            </a>
            <p className="mt-2 text-xs font-semibold text-slate-400">{fp.cta.note}</p>
          </div>
        </section>

        {/* What's included */}
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">Every founding clinic gets</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {fp.includes.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cyan-600 text-[11px] font-black text-white">✓</span>
                <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {offer.pricingModel.map((m) => (
              <span key={m} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600">{m}</span>
            ))}
          </div>
        </section>

        {/* Risk reversal */}
        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">Try it without the risk</p>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-7 text-emerald-950">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-700">{fp.pilot.label}</p>
                <p className="mt-3 text-base font-bold leading-7">{fp.pilot.body}</p>
              </div>
              <div className="rounded-[2rem] border border-cyan-200 bg-white p-7 text-slate-800">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-700">{fp.guarantee.label}</p>
                <p className="mt-3 text-base font-bold leading-7">{fp.guarantee.body}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ROI framing */}
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-cyan-100 bg-cyan-50 p-7 text-cyan-950">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-700">The math that matters</p>
            <p className="mt-3 text-xl font-black leading-8">{offer.roiLine}</p>
            <p className="mt-3 text-sm font-semibold leading-7">
              Recovering even a handful of cancelled sessions a month can cover a plan — and you watch it on the scoreboard.{" "}
              <Link href="/calculator" className="font-black text-cyan-800 underline underline-offset-2">Run your own numbers in the Lost Hours Calculator →</Link>
            </p>
            <p className="mt-4 text-xs font-semibold leading-6 text-cyan-900/70">{offer.breakEvenDisclaimer}</p>
          </div>
        </section>

        {/* Objections */}
        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">Straight answers</p>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {offer.objections.map(([question, answer]) => (
                <div key={question} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-sm font-black text-slate-900">{question}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-slate-950 py-16 text-white">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black tracking-tight">See what your clinic could recover.</h2>
            <p className="mx-auto mt-3 max-w-xl text-base font-semibold leading-7 text-slate-300">
              We&rsquo;ll run the recovery calculator with you and build a custom proposal — founding pricing, locked for life, for the first 10 clinics.
            </p>
            <a
              href={demoHref}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-black text-slate-950 transition hover:bg-slate-100"
            >
              {fp.cta.label} →
            </a>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
