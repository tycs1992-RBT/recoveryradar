import { ContentGenerator } from "@/components/content/ContentGenerator";
import { PageHeader } from "@/components/ui/PageHeader";

export default function ContentGeneratorPage() {
  return (
    <>
      <PageHeader
        eyebrow="Content Generator"
        title="Draft SEO, social and ad assets for human review"
        description="Generate marketing drafts around operational recovery, then edit and approve before publication."
      />
      <ContentGenerator />
    </>
  );
}
