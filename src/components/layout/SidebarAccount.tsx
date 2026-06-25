"use client";

import { useEffect, useState } from "react";

type SidebarAccountProps = {
  email: string;
  role: string;
};

export function SidebarAccount({ email, role }: SidebarAccountProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("recovery-radar-sidebar-account");
    if (saved === "expanded") setCollapsed(false);
    if (saved === "hidden") setHidden(true);
  }, []);

  function minimize() {
    setCollapsed(true);
    setHidden(false);
    window.localStorage.setItem("recovery-radar-sidebar-account", "collapsed");
  }

  function expand() {
    setCollapsed(false);
    setHidden(false);
    window.localStorage.setItem("recovery-radar-sidebar-account", "expanded");
  }

  function hide() {
    setHidden(true);
    window.localStorage.setItem("recovery-radar-sidebar-account", "hidden");
  }

  if (hidden) {
    return (
      <button
        type="button"
        className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-600 shadow-sm transition hover:bg-slate-50"
        onClick={expand}
        aria-label="Show signed-in profile"
      >
        Show signed-in profile
      </button>
    );
  }

  if (collapsed) {
    return (
      <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-1 text-left transition hover:bg-white"
          onClick={expand}
          aria-label="Expand signed-in profile"
          title="Expand signed-in profile"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-950 text-sm font-black text-white">
            {email?.charAt(0)?.toUpperCase() ?? "A"}
          </span>
          <span className="min-w-0">
            <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Signed in</span>
            <span className="block truncate text-xs font-bold text-slate-700">{email}</span>
          </span>
        </button>
        <button
          type="button"
          className="rounded-full px-3 py-2 text-[11px] font-black uppercase tracking-wide text-slate-500 hover:bg-white"
          onClick={hide}
        >
          Hide
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Signed in</p>
          <p className="mt-1 truncate text-sm font-bold text-slate-900" title={email}>{email}</p>
          <p className="text-xs text-slate-500">Role: {role}</p>
        </div>
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-black text-slate-500 hover:bg-slate-100"
          onClick={minimize}
          aria-label="Minimize signed-in profile"
          title="Minimize"
        >
          −
        </button>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-full bg-white px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
          onClick={minimize}
        >
          Minimize
        </button>
        <button
          type="button"
          className="flex-1 rounded-full bg-white px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
          onClick={hide}
        >
          Hide
        </button>
      </div>
    </div>
  );
}
