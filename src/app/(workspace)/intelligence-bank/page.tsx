import { IntelligenceBank } from "@/components/leads/IntelligenceBank";
import { PageHeader } from "@/components/ui/PageHeader";

export default function IntelligenceBankPage() {
  return (
    <>
      <PageHeader
        eyebrow="Master bank"
        title="Alphabetized Intelligence Bank"
        description="Store reviewed companies, clinics, people, emails, websites and source links in one deduped workspace bank. Results stay alphabetized and exportable."
      />
      <IntelligenceBank />
    </>
  );
}
