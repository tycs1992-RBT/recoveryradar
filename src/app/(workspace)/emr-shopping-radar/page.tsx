import { EMRShoppingRadar } from "@/components/leads/EMRShoppingRadar";
import { PageHeader } from "@/components/ui/PageHeader";

export default function EMRShoppingRadarPage() {
  return (
    <>
      <PageHeader
        eyebrow="EMR Shopping Radar"
        title="Find recent ABA EMR/software shopping signals"
        description="Search public indexed Facebook pages/posts, LinkedIn, Reddit, Google, news and blogs for recent ABA software complaints, alternative searches and buying-intent language."
      />
      <EMRShoppingRadar />
    </>
  );
}
