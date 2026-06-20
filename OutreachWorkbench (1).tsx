import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { keywordGroups } from "@/lib/constants";

export default function CampaignPlannerPage() {
  return (
    <>
      <PageHeader
        eyebrow="Campaign Planner"
        title="30-day launch campaign plan"
        description="Use keyword groups, landing pages and outreach queues to launch Recovery Radar demand capture with limited initial spend."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="card">
          <h2 className="text-2xl font-black text-slate-950">Weekly launch checklist</h2>
          <div className="mt-5 space-y-4">
            {[
              ["Week 1", "Finalize architecture, repo, schema, keyword lists and manual lead research."],
              ["Week 2", "Build dashboard shell, Lead Finder, Lost Hours Calculator and initial landing page."],
              ["Week 3", "Launch quiz, refine scoring, load outreach templates, configure SPF/DMARC and review compliance."],
              ["Week 4", "Integrate chatbot, CRM dashboard, SEO articles, low-budget ads and beta clinic invites."]
            ].map(([week, text]) => (
              <article key={week} className="rounded-2xl border border-slate-200 p-4">
                <p className="font-black text-slate-950">{week}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="card">
          <h2 className="text-2xl font-black text-slate-950">Campaign routing</h2>
          <div className="mt-5 space-y-4">
            {keywordGroups.map((group) => (
              <article key={group.groupName} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-black text-slate-950">{group.groupName}</p>
                    <p className="mt-1 text-sm text-slate-500">{group.keywords.length} keywords</p>
                  </div>
                  <Link href={group.landingPage} className="text-xs font-black text-slate-950 underline">Landing page</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
