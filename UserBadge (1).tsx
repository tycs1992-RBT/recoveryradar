import Link from "next/link";
import { LeadTable } from "@/components/leads/LeadTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { mockAnalytics, mockLeads, mockTasks } from "@/lib/mock-data";

export default function DashboardPage() {
  const hotLeads = mockLeads.filter((lead) => lead.leadScore >= 60).length;
  return (
    <>
      <PageHeader
        eyebrow="Command center"
        title="Recovery Radar dashboard"
        description="Monitor demand capture, hot EMR shoppers, calculator completions, quiz personas and follow-up tasks from one workspace."
      >
        <Link href="/api/export/leads" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800">
          Export leads CSV
        </Link>
        <Link href="/lead-finder" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">
          Find leads
        </Link>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Hot leads" value={hotLeads} delta="≥60 score" helper="Prioritize for founder-led outreach and beta conversations." />
        <MetricCard label="Total seed leads" value={mockLeads.length} helper="Replace seed data with Supabase/Postgres records after setup." />
        <MetricCard label="Calculator completions" value={mockAnalytics[2].value} delta={mockAnalytics[2].delta} helper="Public lost-hours calculator completions." />
        <MetricCard label="Demo requests" value={mockAnalytics[5].value} delta={mockAnalytics[5].delta} helper="Early CTA and Provider Portal intent." />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-950">Priority leads</h2>
            <Link href="/crm" className="text-sm font-bold text-slate-950 underline">Open CRM</Link>
          </div>
          <LeadTable leads={mockLeads} />
        </section>

        <section className="card">
          <h2 className="text-2xl font-black text-slate-950">Follow-up queue</h2>
          <div className="mt-5 space-y-3">
            {mockTasks.map((task) => (
              <article key={task.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-black text-slate-950">{task.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{task.type}</p>
                  </div>
                  <span className="badge bg-slate-50">{task.due}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
