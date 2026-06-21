import Link from "next/link";
import { LeadTable } from "@/components/leads/LeadTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";

const emptyLeads: never[] = [];

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Command center"
        title="Recovery Radar dashboard"
        description="Live workspace for demand capture, business leads, keyword research, CRM follow-up and private outreach. No sample leads are shown."
      >
        <Link href="/api/export/leads" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800">
          Export live leads CSV
        </Link>
        <Link href="/lead-machine" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">
          Find live leads
        </Link>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Hot leads" value={0} delta="live" helper="Run Lead Machine or Intent Crawler to create real reviewed leads." />
        <MetricCard label="Total live leads" value={0} helper="Clean slate. Live records appear after search, enrichment, import, or form submissions." />
        <MetricCard label="Calculator completions" value={0} delta="live" helper="Public calculator submissions will appear after production tracking is connected." />
        <MetricCard label="Demo requests" value={0} delta="live" helper="Demo and Provider Portal intent will appear after live events are captured." />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-950">Priority leads</h2>
            <Link href="/lead-machine" className="text-sm font-bold text-slate-950 underline">Build lead list</Link>
          </div>
          <LeadTable leads={emptyLeads} />
        </section>

        <section className="card">
          <h2 className="text-2xl font-black text-slate-950">Follow-up queue</h2>
          <div className="mt-5 rounded-3xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No follow-up tasks yet. Create real tasks from CRM, Lead Machine, or Outreach after adding live leads.
          </div>
        </section>
      </div>
    </>
  );
}
