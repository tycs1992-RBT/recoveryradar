import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { PlaybookSignup } from "@/components/leads/PlaybookSignup";
import { playbookSections, playbookSubtitle } from "@/lib/playbook-content";

export const metadata: Metadata = {
  title: "The ABA Cancellation Recovery Playbook | Infinite Pieces AI",
  description:
    "A free, field-built playbook for ABA clinics: how to protect and recover the authorized hours cancellations quietly erase — prevent, recover, and measure. Built by a 10-year RBT.",
  alternates: { canonical: "/playbook" },
};

export default function PlaybookPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Pitch */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-cyan-600">Free playbook</p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              The ABA Cancellation Recovery Playbook
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">{playbookSubtitle}</p>
            <p className="mt-4 leading-7 text-slate-600">
              Cancellations run ~30% in most ABA clinics — and every one is a unit of approved care a child didn&rsquo;t get. This is the system a 10-year RBT uses to protect those hours and recover the ones that fall through. No fluff, no &ldquo;bill more&rdquo; — just what works on a real clinic day.
            </p>
            <p className="mt-4 text-sm font-bold text-slate-500">
              Weighing us against another tool?{" "}
              <Link href="/compare" className="text-cyan-700 underline">See how Infinite compares →</Link>
            </p>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
              <p className="text-sm font-black text-slate-700">What&rsquo;s inside</p>
              <ul className="mt-3 space-y-2">
                {playbookSections.map((s) => (
                  <li key={s.heading} className="flex gap-2 text-sm leading-6 text-slate-600">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-cyan-500" />
                    <span>{s.heading}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Gate */}
          <div className="lg:pt-10">
            <PlaybookSignup />
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
