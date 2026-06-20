import Link from "next/link";
import { LostHoursCalculator } from "@/components/calculator/LostHoursCalculator";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Lost Hours Calculator"
          title="Estimate ABA hours and revenue at risk from cancellations and callouts"
          description="Enter clinic-level operating estimates only. The calculator displays summary results immediately and can optionally capture consent for a detailed follow-up report."
        >
          <Link href="/quiz" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800">Take quiz</Link>
        </PageHeader>
        <LostHoursCalculator />
      </main>
    </div>
  );
}
