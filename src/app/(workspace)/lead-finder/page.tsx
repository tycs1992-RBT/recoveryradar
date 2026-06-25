import { SocialEMRSourceFinder } from "@/components/leads/SocialEMRSourceFinder";
import { LeadTable } from "@/components/leads/LeadTable";
import { PageHeader } from "@/components/ui/PageHeader";

export default function LeadFinderPage() {
  return (
    <>
      <PageHeader
        eyebrow="Social Source Finder"
        title="Find public social posts from ABA operators shopping for EMR alternatives"
        description="Search Facebook, Reddit, LinkedIn and other public social sources for ABA software complaints, replacement searches and recommendation requests. Generic vendor websites are filtered out."
      />
      <SocialEMRSourceFinder />
      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-black text-slate-950">Current lead queue</h2>
        <LeadTable />
      </div>
    </>
  );
}
