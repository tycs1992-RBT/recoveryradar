import { NpiRadar } from "@/components/leads/NpiRadar";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "New Clinic Radar — NPI registrations" };

export default function NpiRadarPage() {
  return (
    <>
      <PageHeader
        eyebrow="New Clinic Radar"
        title="Reach clinics the week they register"
        description="Live federal NPI registry, filtered to ABA providers and sorted newest-first. New clinics need scheduling and billing software and usually haven't been pitched yet — get to them before competitors do."
      />
      <NpiRadar />
    </>
  );
}
