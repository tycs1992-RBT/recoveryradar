import { TaskInbox } from "@/components/tasks/TaskInbox";
import { PageHeader } from "@/components/ui/PageHeader";

export default function TasksPage() {
  return (
    <>
      <PageHeader
        eyebrow="Outreach Tasks"
        title="Full task inbox with due-date management"
        description="Track CRM follow-ups, approval tasks, due dates, overdue work and human-reviewed outreach from one queue."
      />
      <TaskInbox />
    </>
  );
}
