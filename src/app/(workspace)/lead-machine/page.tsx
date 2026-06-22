import { LeadMachinePro } from "@/components/leads/LeadMachinePro";
import { PageHeader } from "@/components/ui/PageHeader";

export default function LeadMachinePage() {
  return (
    <>
      <PageHeader
        eyebrow="Lead Machine"
        title="Build the 50-200 lead spreadsheet faster"
        description="Use Google Places to collect public business names, phone numbers, websites, addresses, ratings, then enrich public websites. Results are alphabetized, duplicate-checked, and can be saved into the Intelligence Bank."
      />
      <LeadMachinePro />
    </>
  );
}
