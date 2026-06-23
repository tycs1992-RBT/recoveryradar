import { OutreachApprovalQueue } from "@/components/outreach/OutreachApprovalQueue";
import { PageHeader } from "@/components/ui/PageHeader";

export default function OutreachApprovalPage() {
  return (
    <>
      <PageHeader
        eyebrow="Human Approval"
        title="Manual outreach approval queue"
        description="Review drafts, source URLs, company context, current EMR, pain signal and generated message before copying an approved message. Nothing auto-sends."
      />
      <OutreachApprovalQueue />
    </>
  );
}
