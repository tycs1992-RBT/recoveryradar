import Link from "next/link";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-black tracking-tight text-slate-950">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-xl text-cyan-300 shadow-soft">∞</span>
          <span>
            <span className="block text-sm uppercase tracking-[0.3em] text-cyan-700">Infinite Pieces AI</span>
            <span className="block text-lg leading-none">Infinite Suite OS™</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-semibold text-slate-600 md:flex">
          <Link href="/calculator">Lost Hours Calculator</Link>
          <Link href="/roi-simulator">ROI Simulator</Link>
          <Link href="/quiz">Operations Quiz</Link>
          <Link href="/topics">ABA Topics</Link>
          <Link href="/aba-keyword-bank">Keyword Bank</Link>
          <Link href="/trademarks">Trademarks</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login?callbackUrl=/recovery-radar"
            className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-50 sm:inline-flex"
          >
            Owner login
          </Link>
          <Link
            href="/provider-portal"
            className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-soft transition hover:bg-slate-800"
          >
            Provider Portal
          </Link>
          <Link
            href="/school-portal"
            title="School edition preview — take a look"
            className="hidden rounded-2xl border border-dashed border-cyan-400/60 bg-cyan-50/50 px-4 py-2 text-sm font-bold text-cyan-700/80 transition hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-800 sm:inline-flex"
          >
            School Portal
          </Link>
        </div>
      </div>
    </header>
  );
}
