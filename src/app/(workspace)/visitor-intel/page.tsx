import { VisitorIntelView } from "@/components/leads/VisitorIntelView";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Visitor Intel — who's shopping" };

export default function VisitorIntelPage() {
  return (
    <>
      <PageHeader
        eyebrow="Visitor Intel"
        title="Who's been on your high-intent pages"
        description="Company-level signals on who's browsing your pricing and calculator pages — your closest read on who's actively shopping for ABA software right now."
      />
      <VisitorIntelView />
    </>
  );
}
