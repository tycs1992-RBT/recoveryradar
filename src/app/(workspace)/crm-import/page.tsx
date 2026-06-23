import { CRMImportMapper } from "@/components/crm/CRMImportMapper";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CRMImportPage() {
  return (
    <>
      <PageHeader
        eyebrow="CRM Import"
        title="Import leads with field mapping, dedupe preview and score reasons"
        description="Upload a CSV, map columns into CRM/Intelligence Bank fields, detect do-not-contact rows, preview duplicates, score leads and import reviewed records."
      />
      <CRMImportMapper />
    </>
  );
}
