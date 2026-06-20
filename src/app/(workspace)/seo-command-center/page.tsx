import { SEOGrowthSuite } from "@/components/keywords/SEOGrowthSuite";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SeoCommandCenterPage() {
  return (
    <>
      <PageHeader
        eyebrow="SEO Command Center"
        title="Keyword Planner import, SERP checker, page builder and website audit"
        description="The full keyword system: import search-volume CSVs, build pages, check competitors, plan content, generate local SEO pages, audit demo.infinitepieces.ai, and map keywords to leads."
      />
      <SEOGrowthSuite />
    </>
  );
}
