import { LinkedInProspectorPro } from "@/components/leads/LinkedInProspectorPro";
import { PageHeader } from "@/components/ui/PageHeader";

export default function ExecutiveProspectorPage() {
  return (
    <>
      <PageHeader
        eyebrow="Executive Finder"
        title="Find founder, CEO and director prospects"
        description="Search executive profile snippets by niche, market and title. Results are alphabetized, duplicate-checked, and can be saved to the Intelligence Bank."
      />
      <LinkedInProspectorPro />
    </>
  );
}
