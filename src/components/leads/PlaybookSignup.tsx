"use client";

import { useState } from "react";

export function PlaybookSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [clinic, setClinic] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email.");
      return;
    }
    setBusy(true);
    try {
      await fetch("/api/playbook-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, clinic }),
      });
    } catch {
      // Don't punish the reader for a network hiccup — still deliver the playbook.
    }
    // Full navigation (not client-side) so the thank-you page registers as a fresh
    // page load — that's what the Google Ads "Playbook signup" conversion watches for.
    window.location.href = "/playbook/thanks";
  }

  const field = "w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-cyan-400 focus:outline-none";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-black text-slate-900">Get the playbook</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">Drop your email and it opens on the next page — no waiting on an inbox.</p>
      <div className="mt-5 space-y-3">
        <input className={field} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={field} type="email" placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={field} placeholder="Clinic / organization (optional)" value={clinic} onChange={(e) => setClinic(e.target.value)} />
        {error && <p className="text-sm font-semibold text-amber-700">{error}</p>}
        <button onClick={submit} disabled={busy} className="w-full rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white disabled:opacity-50">
          {busy ? "Opening…" : "Open the playbook"}
        </button>
        <p className="text-center text-[11px] text-slate-400">No spam. We&rsquo;ll only follow up if it&rsquo;s useful.</p>
      </div>
    </div>
  );
}
