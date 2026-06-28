import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { comparisons } from "@/lib/comparisons";

export const metadata: Metadata = {
  title: "ABA software comparisons | Infinite Suite OS™",
  description:
    "Comparing Infinite Suite OS™ with CentralReach, Rethink, Motivity, AlohaABA, and Ensora. Where most ABA platforms record and bill sessions, Infinite recovers the authorized hours cancellations cost you.",
  alternates: { canonical: "/compare" },
};

export default function CompareIndex() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main className="mx-auto max-w-4xl px-5 py-12">
        <p className="text-xs font-black uppercase tracking-widest text-cyan-600">Comparisons</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
          How Infinite Suite OS™ compares
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Most ABA platforms are systems of record — they document and bill the session. Infinite is built to recover the authorized hours cancellations take away, with a caregiver app and automatic staff re-assignment. Pick a tool you&rsquo;re weighing:
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {comparisons.map((c) => (
            <Link key={c.slug} href={`/compare/${c.slug}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-300">
              <h2 className="text-lg font-black text-slate-900">Infinite vs {c.competitor}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">{c.bestFor}</p>
              <span className="mt-3 inline-block text-sm font-black text-cyan-700">See the comparison →</span>
            </Link>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
