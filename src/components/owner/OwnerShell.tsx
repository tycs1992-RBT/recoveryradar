import type { ReactNode } from "react";
import Link from "next/link";

const ownerNav = [
  { href: "/recovery-radar", label: "Radar Overview" },
  { href: "/recovery-radar/learners", label: "By Site & Setting" },
  { href: "/recovery-radar/outcomes", label: "Outcomes" },
  { href: "/recovery-radar/waterfall", label: "Recovery Waterfall" },
  { href: "/recovery-radar/pulse", label: "Staff Pulse" },
  { href: "/recovery-radar/alerts", label: "Alerts" },
  { href: "/recovery-radar/simulator", label: "ROI Simulator" }
];

export function OwnerShell({ children, clinicName }: { children: ReactNode; clinicName: string }) {
  return (
    <div className="relative min-h-screen bg-[#070b18] text-slate-200">
      {/* ambient command-center glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <header className="relative border-b border-white/10 bg-white/[0.03] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tight text-cyan-300">∞</span>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-cyan-400">Recovery Radar™</p>
              <p className="text-lg font-black leading-none text-white">{clinicName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-300">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Live
            </span>
            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-amber-300">Demo data</span>
            <Link href="/api/auth/signout" className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-slate-300 hover:border-white/30 hover:text-white">Sign out</Link>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl flex-wrap gap-2 px-4 pb-3 sm:px-6 lg:px-8">
          {ownerNav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-bold text-slate-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-200">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-xs font-semibold leading-5 text-amber-200/90">
          Demonstration workspace — illustrative, de-identified sample data; no real client or staff information. In production each clinic owner sees only their own clinic, with recovery shown at site and setting level only — never an individual learner or name. Per-learner detail lives inside Infinite Suite OS for the assigned clinician. Staff Pulse is reported as clinic/site averages only and never identifies an individual. Dollar figures are estimates pending human review; this is not a billing or clinical system of record.
        </div>
        {children}
      </main>
    </div>
  );
}
