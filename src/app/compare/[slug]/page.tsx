import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { bookingHref } from "@/lib/constants";
import { comparisons, getComparison, infiniteDifferentiators, comparisonRows } from "@/lib/comparisons";

export function generateStaticParams() {
  return comparisons.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getComparison(slug);
  if (!c) return { title: "Comparison" };
  const title = `Infinite Suite OS™ — an alternative to ${c.competitor} for ABA clinics`;
  const description = `Comparing ${c.competitor} and Infinite Suite OS™: where ${c.competitor} is a system of record, Infinite is built to recover the authorized hours cancellations cost you — with a caregiver app and automatic staff re-assignment. Built in the field by a 10-year RBT.`;
  return {
    title,
    description,
    alternates: { canonical: `/compare/${c.slug}` },
    openGraph: { title, description },
  };
}

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getComparison(slug);
  if (!c) notFound();

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      <main className="mx-auto max-w-4xl px-5 py-12">
        <p className="text-xs font-black uppercase tracking-widest text-cyan-600">ABA software comparison</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
          An alternative to {c.competitor}, built to recover the hours you&rsquo;re losing
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          {c.competitor} {c.formerly ? <span className="text-slate-400">({c.formerly})</span> : null} is {c.knownFor} If you&rsquo;re comparing it with Infinite Suite OS™, here&rsquo;s the honest difference — and why a lot of clinics run both.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/calculator" className="rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white">
            See what cancellations cost you
          </Link>
          <Link href={bookingHref} className="rounded-full border border-slate-300 px-6 py-3 text-sm font-black text-slate-800">
            Book a demo
          </Link>
        </div>

        {/* Fair take on the competitor */}
        <section className="mt-12 rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
          <h2 className="text-lg font-black text-slate-900">Where {c.competitor} fits</h2>
          <p className="mt-2 leading-7 text-slate-700">
            <span className="font-bold">Best for:</span> {c.bestFor}
          </p>
          <p className="mt-3 leading-7 text-slate-700">{c.angle}</p>
        </section>

        {/* Infinite differentiators */}
        <section className="mt-12">
          <h2 className="text-xl font-black text-slate-900">What Infinite Suite OS™ does differently</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {infiniteDifferentiators.map((d) => (
              <div key={d.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-black text-cyan-700">{d.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{d.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Approach table */}
        <section className="mt-12">
          <h2 className="text-xl font-black text-slate-900">At a glance</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3"></th>
                  <th className="px-4 py-3 text-cyan-700">Infinite Suite OS™</th>
                  <th className="px-4 py-3">Most ABA platforms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisonRows.map((r) => (
                  <tr key={r.label}>
                    <td className="px-4 py-3 font-bold text-slate-700">{r.label}</td>
                    <td className="px-4 py-3 text-slate-800">{r.infinite}</td>
                    <td className="px-4 py-3 text-slate-500">{r.others}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-400">
            Other platforms&rsquo; capabilities change frequently — confirm current features with each vendor. This page reflects Infinite Suite OS&rsquo;s positioning, not an audit of {c.competitor}.
          </p>
        </section>

        {/* Playbook cross-link */}
        <section className="mt-12 flex flex-col items-start gap-4 rounded-2xl border border-cyan-200 bg-cyan-50/60 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">Not ready for a demo?</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Grab the free <span className="font-bold">ABA Cancellation Recovery Playbook</span> — the system a 10-year RBT uses to stop losing authorized hours.
            </p>
          </div>
          <Link href="/playbook" className="flex-none rounded-full bg-cyan-600 px-6 py-3 text-sm font-black text-white">
            Read the playbook
          </Link>
        </section>

        {/* CTA */}
        <section className="mt-12 rounded-3xl bg-slate-950 p-8 text-center text-white">
          <h2 className="text-2xl font-black">Keep your EMR. Add the recovery layer.</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-300">
            You don&rsquo;t have to rip out {c.competitor} to stop losing authorized hours. Start with the calculator, then see Infinite in a quick demo.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/calculator" className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-black text-white">
              Calculate your lost hours
            </Link>
            <Link href={bookingHref} className="rounded-full border border-white/30 px-6 py-3 text-sm font-black text-white">
              Book a demo
            </Link>
          </div>
        </section>

        {/* Other comparisons */}
        <section className="mt-12">
          <h2 className="text-sm font-black uppercase tracking-wide text-slate-400">Compare with others</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {comparisons.filter((o) => o.slug !== c.slug).map((o) => (
              <Link key={o.slug} href={`/compare/${o.slug}`} className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-bold text-slate-700">
                vs {o.competitor}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
