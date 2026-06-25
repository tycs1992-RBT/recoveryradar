import { CampaignPlannerPro } from "@/components/campaigns/CampaignPlannerPro";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CampaignPlannerPage() {
  return (
    <>
      <PageHeader
        eyebrow="Campaign Planner"
        title="Marketing AI campaign command center"
        description="Build weekly campaign ideas, LinkedIn posts, founder pitches, keyword routing, CTA links and launch actions from the Infinite Suite OS marketing brain."
      />
      <CampaignPlannerPro />
    </>
  );
}
