import { CRMBoard } from "@/components/crm/CRMBoard";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CRMPage() {
  return (
    <>
      <PageHeader
        eyebrow="CRM Leads"
        title="Pipeline by follow-up status"
        description="Move leads through research, connection, demo and founding clinic beta stages. Status changes should be audit logged when connected to the database."
      />
      <CRMBoard />
    </>
  );
}
