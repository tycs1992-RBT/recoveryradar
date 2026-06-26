import Link from "next/link";

// Names presented publicly with a ™ common-law claim. Distinctive marks (worth federal
// filing) and descriptive ones (™ only, weak for registration) are listed together here —
// the ™ notice is free to assert; the filing-priority split lives in the trademark strategy.
const TRADEMARKS = [
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

export function MarketingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 font-black tracking-tight text-slate-950">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-base text-cyan-300">∞</span>
            <span>
              <span className="block text-[10px] uppercase tracking-[0.3em] text-cyan-700">Infinite Pieces AI™</span>
              <span className="block text-sm leading-none">Infinite Suite OS™</span>
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold text-slate-600">
            <Link href="/lost-hours-calculator" className="hover:text-slate-900">Lost Hours Calculator</Link>
            <Link href="/topics" className="hover:text-slate-900">ABA Topics</Link>
            <Link href="/school-portal" className="hover:text-slate-900">School edition</Link>
            <Link href="/trademarks" className="hover:text-slate-900">Trademarks</Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 text-xs leading-6 text-slate-500">
          <p>
            {TRADEMARKS.join(", ")}, and related names, logos, workflows, product concepts, and service
            marks are trademarks or service marks of Infinite Pieces AI. See the{" "}
            <Link href="/trademarks" className="font-semibold text-slate-700 underline">Trademark Notice</Link>.
          </p>
          <p className="mt-3">
            All product names, logos, and brands are property of their respective owners. Use of third-party
            names does not imply affiliation, endorsement, or partnership.
          </p>
          <p className="mt-3">© {year} Infinite Pieces AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
