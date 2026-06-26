import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { MarketingFooter } from "@/components/layout/MarketingFooter";

export const metadata = {
  title: "Trademark Notice | Infinite Pieces AI™",
  description:
    "Trademark and intellectual-property notice for Infinite Pieces AI™ — product names, workflow names, and service marks used across Infinite Suite OS™ and Recovery Radar™.",
  robots: { index: true, follow: true }
};

const MARKS = [
  "Infinite Pieces AI™",
  "Infinite Suite OS™",
  "Infinite Classroom OS™",
  "Recovery Radar™",
  "Recovery Waterfall™",
  "Scheduler AI™",
  "FieldPocket™",
  "Care Pocket™",
  "AnalystPocket™",
  "Program Tree™",
  "SubPool™",
  "Compliance Sentinel™",
  "Material Maker™",
  "Lost Hours Calculator™"
];

export default function TrademarksPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">Legal</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Trademark Notice</h1>

        <p className="mt-6 text-base font-semibold leading-7 text-slate-600">
          Infinite Pieces AI uses the following trademarks, service marks, product names, workflow names,
          and brand identifiers in connection with software, operational recovery workflows, clinic operations
          tools, caregiver communication tools, staff support tools, analytics tools, and healthcare SaaS
          services:
        </p>

        <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {MARKS.map((m) => (
            <li key={m} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-800">{m}</li>
          ))}
        </ul>

        <div className="mt-10 space-y-5 text-sm leading-7 text-slate-600">
          <p>
            These marks are used to identify Infinite Pieces AI products, services, workflows, and software
            experiences. They are claimed as common-law trademarks (™); any federal registrations will be
            indicated with ® once granted.
          </p>
          <p>
            Unauthorized use of these names, marks, logos, workflow names, or confusingly similar names may
            violate trademark, unfair-competition, or other applicable laws.
          </p>
          <p>
            Nothing on this website grants permission to use Infinite Pieces AI trademarks without prior
            written authorization. Third-party trademarks mentioned on this website are the property of their
            respective owners, and their use does not imply affiliation, endorsement, or partnership.
          </p>
        </div>

        <h2 className="mt-12 text-2xl font-black tracking-tight text-slate-950">Intellectual Property</h2>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          All content, product names, workflow names, software concepts, designs, graphics, logos, text,
          interface layouts, demonstrations, images, videos, slide decks, product modules, and service names
          displayed on this website are owned by or licensed to Infinite Pieces AI unless otherwise stated.
        </p>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          You may not copy, modify, distribute, reproduce, sell, license, create derivative works from,
          reverse engineer, or commercially exploit any part of the website, demo, product concepts, product
          names, workflows, or visual identity without prior written permission from Infinite Pieces AI.
        </p>

        <p className="mt-12 text-xs leading-6 text-slate-400">
          This notice is provided for general informational purposes and is not legal advice. Trademark rights
          and registrations are determined under applicable law.
        </p>
      </main>
      <MarketingFooter />
    </div>
  );
}
