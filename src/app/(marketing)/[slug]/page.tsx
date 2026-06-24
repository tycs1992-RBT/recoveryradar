import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { WalkthroughRequestForm } from "@/components/marketing/WalkthroughRequestForm";
import { allLandingPages, type MarketingLandingPageSlug } from "@/lib/seo-pages";

export async function generateStaticParams() {
  return Object.keys(allLandingPages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = allLandingPages[slug as MarketingLandingPageSlug];
  if (!page) return {};
  return {
    title: page.metaTitle,
    description: page.metaDescription
  };
}

export default async function LandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = allLandingPages[slug as MarketingLandingPageSlug];
  if (!page) notFound();

  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingHeader />
      <main>
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-400">Infinite Suite OS™ SEO landing page</p>
            <h1 className="mt-5 max-w-5xl text-5xl font-black tracking-tight text-slate-950 sm:text-7xl">{page.hero}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{page.subheadline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/calculator" className="rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-soft">{page.primaryCta}</Link>
              <Link href="/provider-portal" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-800">{page.secondaryCta}</Link>
              <Link href="/founding-clinic-beta" className="rounded-full border border-amber-200 bg-amber-100 px-6 py-3 text-sm font-black text-amber-950">Founding Clinic Trial</Link>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <article className="card">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">Pain framing</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950">Operational recovery before migration</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">{page.pain}</p>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Infinite Suite OS™ layers recovery workflows over the clinic’s current EMR so teams can identify lost authorized hours, route makeup sessions, support staff, inform caregivers and prepare cleaner documentation.
            </p>
            <div className="mt-6 rounded-2xl bg-cyan-50 p-4 text-sm font-semibold leading-6 text-cyan-950">
              Competitors manage the record. Infinite recovers the hour. The first goal is not migration; the first goal is measurable recovery value.
            </div>
          </article>

          <article className="card">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">Lead capture</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950">{page.formTitle}</h2>
            <WalkthroughRequestForm pageSlug={slug} formTitle={page.formTitle} />
          </article>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="card">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">Recovery workflow visual</p>
            <div className="mt-5 grid gap-3 md:grid-cols-4 lg:grid-cols-8">
              {[
                "Cancellation",
                "Scheduler AI™",
                "Auth War Room",
                "SubPool™",
                "FieldPocket™",
                "Care Pocket™",
                "Compliance Sentinel™",
                "API Hub export"
              ].map((step, index) => (
                <div key={step} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-xs font-black text-slate-400">{index + 1}</p>
                  <p className="mt-2 text-sm font-black text-slate-950">{step}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/aba-clinic-software" className="badge bg-slate-50">ABA clinic software</Link>
              <Link href="/aba-cancellation-management" className="badge bg-slate-50">ABA cancellation management</Link>
              <Link href="/aba-scheduling-software" className="badge bg-slate-50">ABA scheduling software</Link>
              <Link href="/active-learner-pricing" className="badge bg-slate-50">Active-learner pricing</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
