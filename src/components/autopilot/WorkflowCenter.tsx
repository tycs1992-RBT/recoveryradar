"use client";

import Link from "next/link";
import { useState } from "react";

export function WorkflowCenter() {
  const [note, setNote] = useState("Ready. Use the linked workspace tools in order.");

  async function copyChecklist() {
    await navigator.clipboard.writeText([
      "Workflow checklist",
      "1. Find public source in Social Source Finder.",
      "2. Review source manually.",
      "3. Save public business-level context to Intelligence Bank.",
      "4. Review score reasons.",
      "5. Prepare reviewed message in Outreach Approval.",
      "6. Route interested traffic to Calculator.",
      "7. Track results in Analytics."
    ].join("\n"));
    setNote("Checklist copied.");
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">Workflow Center</p>
        <h2 className="mt-2 text-3xl font-black text-slate-950">Founder operating board</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">Use this board to move from source discovery to review, scoring, approved messaging, calculator routing, and analytics.</p>
        <button type="button" onClick={copyChecklist} className="mt-5 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">Copy checklist</button>
        <div className="mt-4 rounded-3xl bg-blue-50 p-4 text-sm font-semibold text-blue-950">{note}</div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link href="/lead-finder" className="card p-5 hover:bg-slate-50"><p className="font-black text-slate-950">Social Source Finder</p><p className="mt-2 text-sm text-slate-600">Find public software-shopping sources.</p></Link>
        <Link href="/intelligence-bank" className="card p-5 hover:bg-slate-50"><p className="font-black text-slate-950">Intelligence Bank</p><p className="mt-2 text-sm text-slate-600">Store deduped research.</p></Link>
        <Link href="/outreach-approval" className="card p-5 hover:bg-slate-50"><p className="font-black text-slate-950">Approval Queue</p><p className="mt-2 text-sm text-slate-600">Review before use.</p></Link>
        <Link href="/analytics" className="card p-5 hover:bg-slate-50"><p className="font-black text-slate-950">Analytics</p><p className="mt-2 text-sm text-slate-600">Track site visits.</p></Link>
        <Link href="/calculator" className="card p-5 hover:bg-slate-50"><p className="font-black text-slate-950">Calculator</p><p className="mt-2 text-sm text-slate-600">Lost-hours baseline.</p></Link>
        <Link href="/crm" className="card p-5 hover:bg-slate-50"><p className="font-black text-slate-950">CRM</p><p className="mt-2 text-sm text-slate-600">Pipeline review.</p></Link>
        <Link href="/tasks" className="card p-5 hover:bg-slate-50"><p className="font-black text-slate-950">Task Inbox</p><p className="mt-2 text-sm text-slate-600">Follow-up queue.</p></Link>
        <Link href="/content-generator" className="card p-5 hover:bg-slate-50"><p className="font-black text-slate-950">Draft Lab</p><p className="mt-2 text-sm text-slate-600">Reviewed content drafts.</p></Link>
      </section>
    </div>
  );
}
