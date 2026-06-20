import Link from "next/link";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { QuizFlow } from "@/components/quiz/QuizFlow";
import { PageHeader } from "@/components/ui/PageHeader";

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="ABA Operations Stack Quiz"
          title="Find the right recovery path before replacing your EMR"
          description="Answer a few operational questions and Recovery Radar will segment your clinic into a recommended Infinite Suite OS™ module path."
        >
          <Link href="/calculator" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800">Calculate lost hours</Link>
        </PageHeader>
        <QuizFlow />
      </main>
    </div>
  );
}
