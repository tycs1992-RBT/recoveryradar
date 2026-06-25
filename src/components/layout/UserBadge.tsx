"use client";

import { useEffect, useState } from "react";

export function UserBadge({ email, role }: { email: string; role: string }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("rr-user-badge-collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    window.localStorage.setItem("rr-user-badge-collapsed", String(next));
  }

  if (collapsed) {
    return (
      <div className="absolute inset-x-5 bottom-5">
        <button
          type="button"
          onClick={toggle}
          className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-soft transition hover:bg-slate-50"
          aria-label="Show signed-in account panel"
        >
          <span className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-950 text-xs font-black text-white">
              {(email || "A").slice(0, 1).toUpperCase()}
            </span>
            <span>
              <span className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400">Signed in</span>
              <span className="block max-w-[170px] truncate text-xs font-bold text-slate-700">{email}</span>
            </span>
          </span>
          <span className="text-lg font-black text-slate-400">⌃</span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-x-5 bottom-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Signed in</p>
          <p className="mt-1 truncate text-sm font-bold text-slate-900">{email}</p>
          <p className="text-xs text-slate-500">Role: {role}</p>
        </div>
        <button
          type="button"
          onClick={toggle}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-xs font-black text-slate-500 transition hover:bg-slate-100"
          aria-label="Minimize signed-in account panel"
          title="Minimize"
        >
          −
        </button>
      </div>
    </div>
  );
}
