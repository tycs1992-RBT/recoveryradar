import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { MarketingFooter } from "@/components/layout/MarketingFooter";

export const metadata: Metadata = {
  title: "Our Purpose — Infinite Pieces AI",
  description:
    "Why Infinite Pieces AI exists: built by a longtime RBT to take the operational load off ABA clinics, so clinicians get their time back for client care. Recover lost hours, support staff, keep documentation audit-ready.",
  robots: { index: true, follow: true },
};

// ABOUT / OUR PURPOSE
// Added in response to direct BCBA feedback that the homepage didn't make the
// primary goal obvious. This page states the mission plainly, leads with founder
// credibility (built by someone who worked the field), and stays inside the
// honest line: operational and assistive software, never clinical decision-making.
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-5 py-12">

        {/* Hero / one-sentence mission */}
        <p className="text-xs font-black uppercase tracking-widest text-cyan-600">Our Purpose</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
          We take the operational load off ABA clinics, so your people can focus on the kids.
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Infinite Pieces AI builds operational and revenue-recovery software for ABA clinics and the
          field staff who run them. Scheduling, cancellations, coverage, and documentation eat hours
          that should go to client care. Our job is to carry that weight so yours doesn&rsquo;t.
        </p>

        {/* Built by the field */}
        <section className="mt-10 rounded-3xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8">
          <h2 className="text-2xl font-black text-slate-950">Built by someone who did the work</h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Infinite Pieces AI was started by a Registered Behavior Technician with about a decade in
            the field. Every feature comes from real shifts: the cancelled session nobody recovered,
            the burnt-out tech who left, the clawback from a note that wasn&rsquo;t airtight. This
            isn&rsquo;t software guessing at what clinics need. It&rsquo;s software shaped by living it.
          </p>
        </section>

        {/* The three things we're trying to fix */}
        <section className="mt-10">
          <h2 className="text-2xl font-black text-slate-950">What we&rsquo;re here to fix</h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Three problems quietly drain ABA clinics every week. Everything we build ladders back to one of them.
          </p>

          <div className="mt-6 space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-black text-slate-950">1 · Recover the hour</h3>
              <p className="mt-2 text-base leading-7 text-slate-600">
                When a session cancels, that authorized hour usually just disappears. Our Recovery
                Waterfall is built to catch it and route it somewhere useful: a same-week makeup, a
                BCBA parent-training session, or approved prep time. The goal is simple, no cancelled
                hour should be lost silently.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-black text-slate-950">2 · Support the staff</h3>
              <p className="mt-2 text-base leading-7 text-slate-600">
                Technician turnover is brutal, and replacing one is expensive and slow. We give field
                staff tools that reduce the grind, surface when someone is overloaded, and help protect
                their hours, so clinics can keep the people they&rsquo;ve trained.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-black text-slate-950">3 · Keep documentation audit-ready</h3>
              <p className="mt-2 text-base leading-7 text-slate-600">
                Clawbacks happen when session notes don&rsquo;t hold up. We help staff produce
                objective, audit-ready documentation from what actually happened in session, so the
                work you did is the work that gets paid.
              </p>
            </div>
          </div>
        </section>

        {/* The line we hold */}
        <section className="mt-10 rounded-3xl border border-cyan-200 bg-cyan-50/50 p-6 sm:p-8">
          <h2 className="text-2xl font-black text-slate-950">The line we hold</h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Infinite Pieces AI is operational and assistive. It supports the humans doing the clinical
            work, it never makes clinical decisions for a child. Clinical judgment stays with your
            BCBAs and RBTs, where it belongs. We handle the logistics around it so your clinicians get
            their time back for the part only they can do.
          </p>
        </section>

        {/* Who it's for */}
        <section className="mt-10">
          <h2 className="text-2xl font-black text-slate-950">Who it&rsquo;s for</h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Clinic owners who feel the leakage in their numbers. BCBAs who lose hours to scheduling and
            coordination instead of supervision and care. RBTs who want the day to run smoother. And
            caregivers, who get a simpler way to handle cancellations and stay in the loop.
          </p>
        </section>

        {/* CTA */}
        <section className="mt-12 rounded-3xl border border-slate-200 bg-slate-950 p-6 text-center sm:p-8">
          <h2 className="text-2xl font-black text-white">Want to see where your clinic is leaking hours?</h2>
          <p className="mx-auto mt-2 max-w-xl text-base leading-7 text-slate-300">
            Start with the Lost Hours Calculator, or reach out and we&rsquo;ll walk you through how the
            recovery workflow fits your clinic.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/lost-hours-calculator"
              className="rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-300"
            >
              Lost Hours Calculator
            </Link>
            <Link
              href="/pricing"
              className="rounded-2xl border border-slate-700 px-6 py-3 text-sm font-black text-white transition hover:bg-slate-800"
            >
              See pricing &amp; book a walkthrough
            </Link>
          </div>
        </section>

      </main>
      <MarketingFooter />
    </div>
  );
}
