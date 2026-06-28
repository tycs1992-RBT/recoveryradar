import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { PlaybookArticle } from "@/components/leads/PlaybookArticle";

// Thank-you / delivery page. This is the URL Google Ads watches as the "Playbook signup"
// conversion (Page load → URL contains /playbook/thanks). Not indexed.
export const metadata: Metadata = {
  title: "Your ABA Cancellation Recovery Playbook",
  robots: { index: false, follow: false },
};

export default function PlaybookThanksPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-4">
          <p className="text-sm font-black text-emerald-800">You&rsquo;re in — here&rsquo;s your playbook.</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">Read it right here. Want a demo of how Infinite automates this? <Link href="/pricing" className="font-bold text-emerald-700 underline">See pricing &amp; book one.</Link></p>
        </div>
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-widest text-cyan-600">The ABA Cancellation Recovery Playbook</p>
          <div className="mt-4">
            <PlaybookArticle />
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
