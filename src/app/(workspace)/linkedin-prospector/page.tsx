import { LinkedInProspector } from "@/components/leads/LinkedInProspector";
import { PageHeader } from "@/components/ui/PageHeader";

export default function LinkedInProspectorPage() {
  return (
    <>
      <PageHeader
        eyebrow="Executive Finder"
        title="Find founder, CEO and director prospects on public LinkedIn results"
        description="Search Google-indexed public LinkedIn profile snippets by niche, market and title. Export names or Google Sheets-ready rows for manual LinkedIn review and compliant outreach."
      />
      <LinkedInProspector />
    </>
  );
}
