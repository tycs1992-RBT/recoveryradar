import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { getPageBySlug } from "@/lib/seo-page-store";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.infinitepieces.ai").replace(/\/$/, "");

// A page is only publicly visible when PUBLISHED. Draft/needs-review/approved pages render
// in a noindex preview only when ?preview=1 is passed; archived/unknown -> notFound.
async function resolvePage(slug: string, preview: boolean) {
  const page = await getPageBySlug(slug);
  if (!page) return null;
  if (page.status === "PUBLISHED") return { page, isPreview: false };
  if (preview && page.status !== "ARCHIVED") return { page, isPreview: true };
  return null;
}

export async function generateMetadata({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;
  const resolved = await resolvePage(slug, preview === "1");
  if (!resolved) return { title: "Not found" };
  const { page, isPreview } = resolved;
  const canonical = `${SITE_URL}/topics/${page.slug}`;
  return {
    title: page.seoTitle || page.title,
    description: page.metaDescription,
    alternates: { canonical },
    openGraph: { title: page.seoTitle || page.title, description: page.metaDescription, url: canonical },
    // Only published pages are indexable.
    robots: isPreview ? { index: false, follow: false } : { index: true, follow: true }
  };
}

export default async function TopicSlugPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const resolved = await resolvePage(slug, preview === "1");
  if (!resolved) notFound();
  const { page, isPreview } = resolved;

  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingHeader />

      {isPreview ? (
        <div className="bg-amber-100 px-4 py-2 text-center text-xs font-black uppercase tracking-[0.25em] text-amber-950">
          Preview — not published, not indexable
        </div>
      ) : null}

      <main>
        {/* 1. Hero */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-400">ABA Buyer Intent Guide</p>
            <h1 className="mt-5 max-w-5xl text-5xl font-black tracking-tight text-slate-950 sm:text-7xl">{page.h1}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{page.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/calculator" className="rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-soft">{page.ctaPrimary}</Link>
              <Link href="/provider-portal" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-800">{page.ctaSecondary}</Link>
            </div>
          </div>
        </section>

        {/* 2-5. Body sections (problem, why-not-migrate, recovery workflow, calculator copy) */}
        <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="space-y-10">
            {page.sections.map((section) => (
              <article key={section.heading} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
                <h2 className="text-3xl font-black text-slate-950">{section.heading}</h2>
                {section.body.split("\n\n").map((para, idx) => (
                  <p key={idx} className="mt-4 whitespace-pre-line text-base leading-8 text-slate-600">{para}</p>
                ))}
              </article>
            ))}
          </div>
        </section>

        {/* 6. FAQ */}
        <section className="mx-auto max-w-4xl px-4 pb-14 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-950">Frequently asked questions</h2>
          <div className="mt-6 space-y-4">
            {page.faq.map((item) => (
              <details key={item.question} className="rounded-2xl border border-slate-200 bg-white p-6">
                <summary className="cursor-pointer text-lg font-black text-slate-900">{item.question}</summary>
                <p className="mt-3 text-base leading-8 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* 8. Final CTA */}
        <section className="bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <h2 className="text-4xl font-black text-white">Recover the session before it disappears</h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/calculator" className="rounded-full bg-white px-6 py-3 text-sm font-black text-slate-950">Lost Hours Calculator</Link>
              <Link href="/provider-portal" className="rounded-full border border-white/30 px-6 py-3 text-sm font-black text-white">Provider Portal</Link>
              <Link href="/founding-clinic-beta" className="rounded-full border border-amber-300 bg-amber-100 px-6 py-3 text-sm font-black text-amber-950">Founding Pilot</Link>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {page.internalLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-xs font-bold uppercase tracking-wide text-slate-400 underline-offset-4 hover:text-white hover:underline">{link.label}</Link>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Compliance note */}
        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="rounded-2xl border border-slate-200 bg-slate-100 p-5 text-xs font-semibold leading-6 text-slate-500">{page.complianceNotes}</p>
        </section>
      </main>

      {/* JSON-LD schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(page.schemaJson) }} />
    </div>
  );
}
