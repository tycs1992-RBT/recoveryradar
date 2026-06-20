import { LeadMachine } from "@/components/leads/LeadMachine";
import { PageHeader } from "@/components/ui/PageHeader";

export default function LeadMachinePage() {
  return (
    <>
      <PageHeader
        eyebrow="Lead Machine"
        title="Build the 50-200 lead spreadsheet faster"
        description="Use Google Places to collect public business names, phone numbers, websites, addresses, ratings, then enrich public websites for business emails/contact forms. Review every source before outreach."
      />
      <LeadMachine />
    </>
  );
}
