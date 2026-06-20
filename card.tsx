import Link from "next/link";
import { SEOGrowthSuite } from "@/components/keywords/SEOGrowthSuite";
import { PageHeader } from "@/components/ui/PageHeader";
import { keywordGroups } from "@/lib/constants";

export default function KeywordRadarPage() {
  return (
    <>
      <PageHeader
        eyebrow="Keyword Radar"
        title="SEO, Google Ads, SERP and page-building command center"
        description="Import Keyword Planner CSVs, score opportunities, build landing page briefs, map keywords to URLs, check SERPs, plan local SEO, audit your site, and connect keyword intent to lead follow-up."
      />
      <SEOGrowthSuite />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {keywordGroups.map((group) => (
          <article key={group.groupName} className="card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-slate-400">{group.groupName}</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">{group.landingPage}</h2>
              </div>
              <Link href={group.landingPage} className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white">Open</Link>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{group.description}</p>
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Keywords</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.keywords.map((keyword) => <span key={keyword} className="badge bg-slate-50">{keyword}</span>)}
              </div>
            </div>
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Ad headlines</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.headlines.map((headline) => <span key={headline} className="badge">{headline}</span>)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
