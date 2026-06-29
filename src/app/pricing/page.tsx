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

// Clinical-integrity FAQ — the questions a clinical buyer asks after the
// "hours billed vs. outcomes" debate. Lives here (pricing-page-specific). The
// generic sales objections (offer.objections) are filtered to avoid repeating
// the "billing more hours" item, which gets its full answer below.
const faqs: [string, string][] = [
  [
    "Isn't this just a way to bill more hours?",
    "No. Infinite never adds or recommends hours — the BCBA sets every child's plan. It recovers sessions that were already authorized and then lost to a cancellation or callout, so the care a family was already promised actually happens. That's continuity of approved care, not more of it — and the Outcomes view shows whether those hours are producing progress, not just that they were billed."
  ],
  [
    "Does Infinite decide how many hours a child gets?",
    "Never. Dosage and the clinical plan belong to the BCBA, full stop. Infinite is dosage-agnostic: it delivers whatever was authorized — whether that's 12 hours a week or 40 — and surfaces whether it's working. It makes no clinical recommendations and sets no targets."
  ],
  [
    "Is Infinite a clinical or billing system of record?",
    "No. Infinite runs beside your EMR as an operational layer — recovering authorized sessions and rolling up progress. Your EMR stays the source of truth for clinical documentation and billing. There's no migration and nothing to rip out."
  ],
  [
    "Where does the Outcomes data come from — is it per-child?",
    "It's the goal progress your clinicians already record, rolled up to clinic, setting, and domain level. Owners and directors see aggregates only — never an individual child's record. Client-level detail stays inside the clinical workflow, role-restricted to the people assigned to that child."
  ],
  [
    "How is pricing set if there are no numbers on this page?",
    "Pricing follows your clinic's size and what Infinite actually recovers for you — proven in a free pilot first, then locked for life for the first 10 founding clinics. We build the proposal with you on a call using your real numbers, so the price always maps to the value."
  ]
];

export default function PricingPage() {
  const fp = offer.foundingProgram;
  const demoHref =
    process.env.NEXT_PUBLIC_BOOKING_URL ||
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

        {/* Care frame — precision over volume */}
        <section className="border-b border-cyan-100 bg-cyan-50/40">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-700">{offer.careFrameTag}</p>
            <p className="mt-3 text-lg font-bold leading-8 text-slate-800">{offer.careFrame}</p>
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
              {offer.objections.filter(([q]) => !q.toLowerCase().includes("billing more")).map(([question, answer]) => (
                <div key={question} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-sm font-black text-slate-900">{question}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ — clinical integrity & how it works (native accordion, no JS) */}
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">Questions clinical leaders ask</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Precision over volume — in practice</h2>
          <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">
            Recovering a cancelled session delivers care a child is already approved for. Infinite never sets or recommends a child&rsquo;s hours — that&rsquo;s the BCBA&rsquo;s call. Here&rsquo;s how that line stays clean.
          </p>
          <div className="mt-7 space-y-3">
            {faqs.map(([q, a]) => (
              <details key={q} className="group rounded-2xl border border-slate-200 bg-white p-5 open:bg-slate-50/60">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-black text-slate-900 marker:hidden">
                  <span>{q}</span>
                  <span className="mt-0.5 shrink-0 text-lg leading-none text-cyan-600 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Fair terms / data ownership — the anti-incumbent promise. Built from
            real reviews of the market leader: nickel-and-dime add-ons, auto-renew
            traps, and records held hostage on exit are the loudest complaints. */}
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">No traps. No hostages.</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">The fair-terms promise</h2>
          <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">
            The biggest complaints about legacy ABA software aren&rsquo;t about features. They&rsquo;re about
            being nickel-and-dimed, locked into auto-renewals, and having your own records held hostage when
            you try to leave. We built the opposite.
          </p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-base font-black text-slate-900">Your data is yours</h3>
              <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">Export everything, anytime. If you ever leave, you walk out with your records. No ransom, no 4-step download per file.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-base font-black text-slate-900">No auto-renew traps</h3>
              <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">Fair, plain terms. We won&rsquo;t quietly renew you a month early and call it your fault. You stay because it works.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-base font-black text-slate-900">Transparent, flat pricing</h3>
              <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">No per-feature add-on tax, no paying for every employee to unlock a button. What you see is what you pay.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-base font-black text-slate-900">You talk to the person who built it</h3>
              <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">Built by someone who spent a decade as an RBT. Support isn&rsquo;t a ticket black hole — it&rsquo;s a real person who knows the work.</p>
            </div>
          </div>
          <p className="mt-5 text-sm font-semibold leading-7 text-slate-500">
            Built so your team never loses a data point mid-session, and simple enough to teach a new RBT in a day.
          </p>
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
