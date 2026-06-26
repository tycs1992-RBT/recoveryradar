import Link from "next/link";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { seoPageCatalog } from "@/lib/seo-pages";
import { listPublishedPages } from "@/lib/seo-page-store";
import { SEO_CATEGORIES } from "@/lib/seo-page-types";

export const metadata = {
  title: "ABA Operations Recovery Topics | Infinite Suite OS",
  description: "Explore ABA clinic software, cancellation management, scheduling recovery, staff coverage and active-learner pricing topics from Infinite Suite OS."
};

export default async function TopicsPage() {
  const published = await listPublishedPages();
  const grouped = SEO_CATEGORIES.map((category) => ({
    category,
    pages: published.filter((page) => page.keywordCluster === category)
  })).filter((group) => group.pages.length > 0);

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

        {/* Factory-published pages, grouped by category */}
        {grouped.map((group) => (
          <section key={group.category} className="mt-12">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">{group.category}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {group.pages.map((page) => (
                <article key={page.slug} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">{page.keyword}</p>
                  <h3 className="mt-3 text-2xl font-black text-slate-950">{page.h1}</h3>
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{page.metaDescription}</p>
                  <Link href={`/topics/${page.slug}`} className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">Open topic page</Link>
                </article>
              ))}
            </div>
          </section>
        ))}

        {/* For schools — pillar entry point to the school edition */}
        <section className="mt-12 rounded-[2rem] border border-cyan-100 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-8 shadow-soft">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-600">For schools</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Running ABA in a school, not a clinic?</h2>
          <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">
            Infinite Classroom OS™ is the school edition of Infinite Suite OS™ — data collection, field tools, visual schedules, and AAC for classroom teams, without the billing-recovery layer schools don&rsquo;t use.
          </p>
          <Link href="/school-portal" className="mt-5 inline-flex rounded-2xl bg-cyan-500 px-6 py-3 text-sm font-black text-white shadow-soft transition hover:bg-cyan-600">See Infinite Classroom OS™ →</Link>
        </section>

        {/* Existing static topic catalog */}
        <section className="mt-12">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">More ABA topics</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {seoPageCatalog.map((page) => (
              <article key={page.slug} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">{page.cluster}</p>
                <h3 className="mt-3 text-2xl font-black text-slate-950">{page.h1}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{page.metaDescription}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {page.targetKeywords.slice(0, 4).map((keyword) => <span key={keyword} className="badge bg-slate-50">{keyword}</span>)}
                </div>
                <Link href={page.path} className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">Open topic page</Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
