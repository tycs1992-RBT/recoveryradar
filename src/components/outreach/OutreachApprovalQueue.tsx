"use client";

import { useEffect, useMemo, useState } from "react";

type ApprovalStatus = "DRAFTED" | "NEEDS_REVIEW" | "APPROVED" | "SENT_MANUALLY" | "REPLIED" | "DO_NOT_CONTACT" | "SUPPRESSED";

type ApprovalTask = {
  id: string;
  leadId: string;
  status: string;
  taskType?: string;
  dueDate?: string | null;
  assignedTo?: string | null;
  generatedMessage?: string | null;
  lead?: {
    id: string;
    companyName: string;
    contactName?: string | null;
    contactRole?: string | null;
    currentEmr?: string | null;
    painPoint?: string | null;
    sourceUrl?: string | null;
    publicEmail?: string | null;
    status?: string | null;
  } | null;
};

const statusOptions: ApprovalStatus[] = ["DRAFTED", "NEEDS_REVIEW", "APPROVED", "SENT_MANUALLY", "REPLIED", "DO_NOT_CONTACT", "SUPPRESSED"];

function normalizeStatus(status: string): ApprovalStatus {
  if (status === "APPROVED") return "APPROVED";
  if (status === "SENT") return "SENT_MANUALLY";
  if (status === "COMPLETED") return "REPLIED";
  if (status === "CANCELLED") return "SUPPRESSED";
  return "NEEDS_REVIEW";
}

function toOutreachStatus(status: ApprovalStatus) {
  if (status === "APPROVED") return "APPROVED";
  if (status === "SENT_MANUALLY") return "SENT";
  if (status === "REPLIED") return "COMPLETED";
  if (status === "DO_NOT_CONTACT" || status === "SUPPRESSED") return "CANCELLED";
  return "PENDING";
}

function defaultMessage(task: ApprovalTask) {
  const company = task.lead?.companyName ?? "your clinic";
  const emr = task.lead?.currentEmr ? ` while keeping ${task.lead.currentEmr}` : " without replacing your current EMR";
  return task.generatedMessage || `Hi — I am reaching out because ${company} may benefit from calculating lost ABA hours from cancellations, callouts and recovery gaps${emr}. Before switching systems, it may be worth estimating the lost-hours baseline: https://www.infinitepieces.ai/calculator`;
}

export function OutreachApprovalQueue() {
  const [tasks, setTasks] = useState<ApprovalTask[]>([]);
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | "ALL">("ALL");
  const [notice, setNotice] = useState("Loading manual approval queue...");

  const rows = useMemo(() => {
    const mapped = tasks.map((task) => ({ ...task, approvalStatus: normalizeStatus(task.status) }));
    return statusFilter === "ALL" ? mapped : mapped.filter((task) => task.approvalStatus === statusFilter);
  }, [statusFilter, tasks]);

  async function loadTasks() {
    try {
      const response = await fetch("/api/outreach-tasks", { cache: "no-store" });
      const data = await response.json();
      setTasks(data.tasks ?? []);
      setNotice(`Loaded ${data.tasks?.length ?? 0} outreach drafts. Nothing sends automatically.`);
    } catch {
      setNotice("Could not load outreach tasks. Check database/API connection.");
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function updateTask(task: ApprovalTask, approvalStatus: ApprovalStatus) {
    setTasks((prev) => prev.map((row) => row.id === task.id ? { ...row, status: toOutreachStatus(approvalStatus) } : row));
    try {
      const response = await fetch("/api/outreach-tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, status: toOutreachStatus(approvalStatus), generatedMessage: defaultMessage(task) })
      });
      const data = await response.json();
      setNotice(response.ok ? data.notification ?? `Draft marked ${approvalStatus}.` : data.error ?? "Status update failed.");
    } catch {
      setNotice(`Draft marked ${approvalStatus} locally. Connect database to persist.`);
    }
  }

  async function copyApprovedMessage(task: ApprovalTask) {
    if (normalizeStatus(task.status) !== "APPROVED") {
      setNotice("Approve the draft before copying. This preserves human review before outreach.");
      return;
    }
    await navigator.clipboard.writeText(defaultMessage(task));
    setNotice("Approved message copied. Send manually from LinkedIn/email. Nothing was auto-sent.");
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        {statusOptions.slice(0, 4).map((status) => (
          <button key={status} type="button" onClick={() => setStatusFilter(status)} className="card p-5 text-left hover:bg-slate-50">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">{status.replaceAll("_", " ")}</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{tasks.filter((task) => normalizeStatus(task.status) === status).length}</p>
          </button>
        ))}
      </section>

      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-950">Manual approval queue</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Review source URL, lead, company, current EMR, pain signal and generated message. This page never auto-sends. It only approves and copies human-reviewed messages.</p>
          </div>
          <select className="input max-w-xs" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ApprovalStatus | "ALL")}>
            <option value="ALL">All statuses</option>
            {statusOptions.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
          </select>
        </div>
        <div className="mt-6 rounded-3xl bg-blue-50 p-4 text-sm font-semibold leading-6 text-blue-950">{notice}</div>
      </section>

      <section className="space-y-4">
        {rows.length ? rows.map((task) => {
          const approvalStatus = normalizeStatus(task.status);
          const isSuppressed = approvalStatus === "DO_NOT_CONTACT" || approvalStatus === "SUPPRESSED" || task.lead?.status === "DO_NOT_CONTACT";
          return (
            <article key={task.id} className={`card ${isSuppressed ? "border-red-200 bg-red-50" : ""}`}>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <span className="badge bg-slate-50">{approvalStatus.replaceAll("_", " ")}</span>
                    <span className="badge bg-slate-50">{task.taskType?.replaceAll("_", " ").toLowerCase() ?? "outreach"}</span>
                    {isSuppressed ? <span className="badge bg-red-100 text-red-700">do not contact</span> : null}
                  </div>
                  <h3 className="mt-3 text-xl font-black text-slate-950">{task.lead?.companyName ?? "Unmatched lead"}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Lead: {task.lead?.contactName ?? "Research contact"} · Role: {task.lead?.contactRole ?? "Unknown"} · Current EMR: {task.lead?.currentEmr ?? "Unknown"}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Pain signal: {task.lead?.painPoint ?? "Review source manually"}</p>
                  {task.lead?.sourceUrl ? <a href={task.lead.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-black text-slate-950 underline">Open source URL</a> : null}
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700 whitespace-pre-wrap">{defaultMessage(task)}</div>
                  <p className="mt-3 text-xs font-semibold text-slate-500">Reviewer: human required · Review timestamp: {approvalStatus === "APPROVED" ? new Date().toLocaleString() : "pending"}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:w-[520px]">
                  <select className="input" value={approvalStatus} onChange={(event) => updateTask(task, event.target.value as ApprovalStatus)}>
                    {statusOptions.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
                  </select>
                  <button type="button" onClick={() => updateTask(task, "APPROVED")} disabled={isSuppressed} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-50">Approve draft</button>
                  <button type="button" onClick={() => copyApprovedMessage(task)} disabled={isSuppressed} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 disabled:opacity-50">Copy approved message</button>
                  <button type="button" onClick={() => updateTask(task, "DO_NOT_CONTACT")} className="rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-700">Do not contact</button>
                </div>
              </div>
            </article>
          );
        }) : <div className="card border-dashed text-center text-sm text-slate-500">No outreach drafts match this filter.</div>}
      </section>
    </div>
  );
}
