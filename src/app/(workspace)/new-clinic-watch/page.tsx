import { NewClinicWatch } from "@/components/leads/NewClinicWatch";
import { PageHeader } from "@/components/ui/PageHeader";

export default function NewClinicWatchPage() {
  return (
    <>
      <PageHeader
        eyebrow="New Clinic Watch"
        title="Track newly opened & opening ABA clinics"
        description="Curate the Facebook, Instagram, and website links of new and soon-to-open ABA clinics and companies. You add the links you find; stored in your browser, exportable to CSV anytime."
      />
      <NewClinicWatch />
    </>
  );
}
