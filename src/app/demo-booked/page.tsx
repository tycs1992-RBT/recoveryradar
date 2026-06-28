import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { MarketingFooter } from "@/components/layout/MarketingFooter";

// Confirmation page Calendly/Cal.com redirects to after a booking. This is the URL
// Google Ads watches as the "Demo booking" conversion (Page load → URL contains
// /demo-booked). Not indexed.
export const metadata: Metadata = {
  title: "You're booked — Infinite Suite OS™",
  robots: { index: false, follow: false },
};

export default function DemoBookedPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main className="mx-auto max-w-2xl px-5 py-20 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500 text-3xl text-white">✓</div>
        <h1 className="mt-6 text-3xl font-black text-slate-950">You&rsquo;re booked.</h1>
        <p className="mx-auto mt-3 max-w-md text-lg leading-8 text-slate-600">
          Thanks for setting up a demo. You&rsquo;ll get a calendar invite by email — no need to do anything else.
        </p>
        <p className="mx-auto mt-2 max-w-md leading-7 text-slate-500">
          Want a head start? While you wait, the free playbook covers the exact system we&rsquo;ll walk through.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/playbook" className="rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white">Read the playbook</Link>
          <Link href="/calculator" className="rounded-full border border-slate-300 px-6 py-3 text-sm font-black text-slate-800">See what cancellations cost you</Link>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
