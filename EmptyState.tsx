import { IntentFinderPanel } from "@/components/leads/IntentFinderPanel";
import { LeadTable } from "@/components/leads/LeadTable";
import { PageHeader } from "@/components/ui/PageHeader";

export default function LeadFinderPage() {
  return (
    <>
      <PageHeader
        eyebrow="Intent Finder"
        title="Find public signals from ABA operators shopping, opening or scaling"
        description="Search public pages for clinic openings, hiring, EMR alternatives and operational pain. Every source is reviewed before a lead is added."
      />
      <IntentFinderPanel />
      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-black text-slate-950">Current lead queue</h2>
        <LeadTable />
      </div>
    </>
  );
}
