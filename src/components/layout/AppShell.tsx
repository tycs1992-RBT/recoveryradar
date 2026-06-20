import type { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { navItems } from "@/lib/constants";
import { roleLabel } from "@/lib/rbac";

export async function AppShell({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: "admin" | "growth" | "viewer" } | undefined)?.role;
  const email = session?.user?.email ?? "Founders";

  return (
    <div className="min-h-screen bg-slate-50">
      <input id="workspace-sidebar-toggle" type="checkbox" className="sr-only" aria-label="Collapse workspace sidebar" />

      <aside className="workspace-sidebar fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-slate-200 bg-white p-5 transition-all duration-300 lg:flex">
        <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
          <Link href="/" className="workspace-brand block min-w-0 flex-1 rounded-3xl bg-slate-950 p-5 text-white shadow-soft transition-all duration-300">
            <p className="sidebar-full-text text-xs uppercase tracking-[0.35em] text-slate-400">Infinite Pieces AI</p>
            <p className="sidebar-collapsed-text hidden text-center text-2xl font-black tracking-tight text-white">RR</p>
            <h1 className="sidebar-full-text mt-3 text-2xl font-black tracking-tight">Recovery Radar™</h1>
            <p className="sidebar-full-text mt-2 text-sm text-slate-300">Lead agent + recovery growth workspace.</p>
          </Link>
          <label
            htmlFor="workspace-sidebar-toggle"
            className="sidebar-toggle inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            title="Minimize sidebar"
            aria-label="Minimize sidebar"
          >
            <span className="sidebar-full-text text-xl leading-none">‹</span>
            <span className="sidebar-collapsed-text hidden text-xl leading-none">›</span>
          </label>
        </div>

        <nav className="workspace-nav min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const initials = item.label
              .split(" ")
              .map((word) => word[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <Link
                key={item.href}
                href={item.href}
                className="workspace-nav-item group flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                title={item.label}
              >
                <span className="sidebar-collapsed-nav-label hidden">{initials}</span>
                <span className="sidebar-label min-w-0 truncate">{item.label}</span>
                <span className="sidebar-eyebrow text-[10px] font-medium uppercase tracking-wide text-slate-400 group-hover:text-slate-500">
                  {item.eyebrow}
                </span>
              </Link>
            );
          })}
        </nav>

        <details className="workspace-account mt-4 shrink-0 rounded-3xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-2 py-1 font-bold text-slate-900">
            <span className="sidebar-label min-w-0 truncate">Signed in</span>
            <span className="sidebar-eyebrow rounded-full bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">show</span>
            <span className="sidebar-collapsed-text hidden text-center text-xs font-black uppercase tracking-wide text-slate-500">Acct</span>
          </summary>
          <div className="sidebar-full-text mt-3 rounded-2xl bg-white p-3 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Private workspace</p>
            <p className="mt-1 truncate text-sm font-bold text-slate-900" title={email}>{email}</p>
            <p className="text-xs text-slate-500">Role: {roleLabel(role)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href="/" className="rounded-full border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">Public site</a>
              <a href="/api/auth/signout" className="rounded-full bg-slate-950 px-3 py-2 text-xs font-black text-white hover:bg-slate-800">Sign out</a>
            </div>
          </div>
        </details>
      </aside>

      <main className="workspace-main min-w-0 transition-all duration-300 lg:pl-72">
        <div className="mx-auto w-full max-w-[1800px] p-4 sm:p-6 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
