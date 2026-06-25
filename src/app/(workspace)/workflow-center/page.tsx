import { WorkflowCenter } from "@/components/autopilot/WorkflowCenter";
import { PageHeader } from "@/components/ui/PageHeader";

export default function WorkflowCenterPage() {
  return (
    <>
      <PageHeader
        eyebrow="Workflow"
        title="Founder operating board"
        description="A single board for moving through the workspace tools in order."
      />
      <WorkflowCenter />
    </>
  );
}
