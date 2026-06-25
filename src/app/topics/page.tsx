import Link from "next/link";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { seoPageCatalog } from "@/lib/seo-pages";

export const metadata = {
  title: "ABA Operations Recovery Topics | Infinite Suite OS",
  description: "Explore ABA clinic software, cancellation management, scheduling recovery, staff coverage and active-learner pricing topics from Infinite Suite OS."
};

export default function TopicsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingHeader />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-400">ABA topic hub</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-950">Operational recovery topics for ABA clinics</h1>
          <p className="mt-5 text-lg font-semibold leading-8 text-slate-600">
            Use these pages to explore how Infinite Suite OS™ sits beside the current EMR to recover lost hours, reduce scheduler scramble, support staff, and create cleaner proof packets.
          </p>
        </section>
        <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {seoPageCatalog.map((page) => (
            <article key={page.slug} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">{page.cluster}</p>
              <h2 className="mt-3 text-2xl font-black text-slate-950">{page.h1}</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{page.metaDescription}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {page.targetKeywords.slice(0, 4).map((keyword) => <span key={keyword} className="badge bg-slate-50">{keyword}</span>)}
              </div>
              <Link href={page.path} className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">Open topic page</Link>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
