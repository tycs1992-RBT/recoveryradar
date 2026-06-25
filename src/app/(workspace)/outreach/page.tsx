import { OutreachWorkbench } from "@/components/outreach/OutreachWorkbench";
import { PageHeader } from "@/components/ui/PageHeader";

export default function OutreachPage() {
  return (
    <>
      <PageHeader
        eyebrow="Outreach Templates"
        title="Generate compliant, manually approved outreach drafts"
        description="Merge lead fields into LinkedIn and email templates while preserving opt-out language, honest identity and no-migration positioning."
      />
      <OutreachWorkbench />
    </>
  );
}
