"use client";

import { useEffect, useMemo, useState } from "react";
import { mockLeads, mockTasks } from "@/lib/mock-data";

type OutreachStatus = "PENDING" | "APPROVED" | "SENT" | "COMPLETED" | "CANCELLED";
type OutreachTaskType = "CONNECTION_NOTE" | "INMAIL" | "EMAIL_FOLLOWUP" | "CALL";

type LeadSummary = {
  id: string;
  companyName: string;
  contactName?: string | null;
  contactRole?: string | null;
  leadScore?: number | null;
  nextStep?: string | null;
};

type TaskLike = {
  id: string;
  leadId: string;
  title?: string;
  due?: string;
  dueDate?: string | null;
  status: OutreachStatus | string;
  taskType?: OutreachTaskType | string;
  type?: string;
  assignedTo?: string | null;
  priority?: "high" | "medium" | "low";
  generatedMessage?: string | null;
  lead?: LeadSummary | null;
};

const statusOptions: OutreachStatus[] = ["PENDING", "APPROVED", "SENT", "COMPLETED", "CANCELLED"];
const filterOptions = ["all", "due_today", "overdue", "upcoming", "pending", "approved", "completed"] as const;

type FilterOption = (typeof filterOptions)[number];

function formatTaskType(type?: string) {
  return (type ?? "CONNECTION_NOTE").replaceAll("_", " ").toLowerCase();
}

function toDateOnly(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getDueState(dueDate?: string | null) {
  if (!dueDate) return "No due date";
  const due = new Date(dueDate);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (Number.isNaN(due.getTime())) return "No due date";
  if (isSameDay(due, today)) return "Due today";
  if (due < startOfToday) return "Overdue";
  return `Due ${due.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

function getLeadForTask(task: TaskLike): LeadSummary {
  const matchedLead = mockLeads.find((lead) => lead.id === task.leadId);
  return (
    task.lead ??
    (matchedLead
      ? {
          id: matchedLead.id,
          companyName: matchedLead.companyName,
          contactName: matchedLead.contactName,
          contactRole: matchedLead.contactRole,
          leadScore: matchedLead.leadScore,
          nextStep: matchedLead.nextStep
        }
      : { id: task.leadId, companyName: "Unmatched lead" })
  );
}

export function TaskInbox() {
  const [tasks, setTasks] = useState<TaskLike[]>(mockTasks);
  const [filter, setFilter] = useState<FilterOption>("all");
  const [notification, setNotification] = useState("Task inbox loaded. Public outreach still requires manual review before sending.");

  useEffect(() => {
    let mounted = true;
    fetch("/api/outreach-tasks")
      .then((response) => response.json() as Promise<{ tasks?: TaskLike[]; source?: string }>)
      .then((data) => {
        if (mounted && data.tasks?.length) {
          setTasks(data.tasks);
          setNotification(`Loaded ${data.tasks.length} outreach task${data.tasks.length === 1 ? "" : "s"} from ${data.source ?? "workspace"}.`);
        }
      })
      .catch(() => {
        if (mounted) setNotification("Using mock task inbox until the database is connected.");
      });
    return () => {
      mounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const today = new Date();
    const pending = tasks.filter((task) => task.status === "PENDING").length;
    const approved = tasks.filter((task) => task.status === "APPROVED").length;
    const overdue = tasks.filter((task) => {
      if (!task.dueDate || task.status === "COMPLETED" || task.status === "CANCELLED") return false;
      const due = new Date(task.dueDate);
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      return !Number.isNaN(due.getTime()) && due < start;
    }).length;
    const dueToday = tasks.filter((task) => task.dueDate && isSameDay(new Date(task.dueDate), today)).length;
    return { pending, approved, overdue, dueToday };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    return tasks.filter((task) => {
      const due = task.dueDate ? new Date(task.dueDate) : null;
      if (filter === "all") return true;
      if (filter === "pending") return task.status === "PENDING";
      if (filter === "approved") return task.status === "APPROVED";
      if (filter === "completed") return task.status === "COMPLETED";
      if (filter === "due_today") return due ? isSameDay(due, today) : false;
      if (filter === "overdue") return due ? due < start && task.status !== "COMPLETED" && task.status !== "CANCELLED" : false;
      if (filter === "upcoming") return due ? due > start : false;
      return true;
    });
  }, [filter, tasks]);

  async function updateTask(id: string, payload: Partial<Pick<TaskLike, "status" | "dueDate" | "assignedTo" | "generatedMessage">>) {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...payload } : task)));

    try {
      const response = await fetch("/api/outreach-tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...payload })
      });
      const data = (await response.json()) as { notification?: string; error?: string };
      setNotification(response.ok ? data.notification ?? "Task updated." : data.error ?? "Task update failed.");
    } catch {
      setNotification("Task updated locally. Connect the database to persist changes.");
    }
  }

  function openOutreach(leadId: string) {
    window.location.href = `/outreach?leadId=${leadId}`;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <div className="card p-5"><p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Pending</p><p className="mt-2 text-3xl font-black text-slate-950">{metrics.pending}</p></div>
        <div className="card p-5"><p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Approved</p><p className="mt-2 text-3xl font-black text-slate-950">{metrics.approved}</p></div>
        <div className="card p-5"><p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Due today</p><p className="mt-2 text-3xl font-black text-slate-950">{metrics.dueToday}</p></div>
        <div className="card p-5"><p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Overdue</p><p className="mt-2 text-3xl font-black text-red-600">{metrics.overdue}</p></div>
      </section>

      <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-blue-950">{notification}</div>

      <section className="card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">Task inbox</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Manual-review outreach queue</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Create follow-up tasks from CRM, set due dates, approve drafts, and keep outreach human-reviewed before anything is sent.</p>
          </div>
          <select className="input max-w-xs" value={filter} onChange={(event) => setFilter(event.target.value as FilterOption)}>
            {filterOptions.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}
          </select>
        </div>

        <div className="mt-6 space-y-4">
          {filteredTasks.length ? filteredTasks.map((task) => {
            const lead = getLeadForTask(task);
            const dueState = getDueState(task.dueDate);
            const isOverdue = dueState === "Overdue" && task.status !== "COMPLETED" && task.status !== "CANCELLED";
            return (
              <article key={task.id} className={`rounded-3xl border p-5 ${isOverdue ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"}`}>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><span className="badge bg-slate-50">{formatTaskType(task.taskType ?? task.type)}</span><span className={`badge ${isOverdue ? "border-red-200 bg-red-100 text-red-700" : "bg-white"}`}>{dueState}</span><span className="badge bg-white">{task.status}</span></div>
                    <h3 className="mt-3 text-xl font-black text-slate-950">{task.title ?? `${formatTaskType(task.taskType)} for ${lead.companyName}`}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{lead.companyName} · {lead.contactRole ?? "Research role"} · Assigned to {task.assignedTo ?? "Unassigned"}</p>
                    {task.generatedMessage ? <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">{task.generatedMessage}</p> : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:w-[520px]">
                    <label className="space-y-2"><span className="label">Due date</span><input type="date" className="input" value={toDateOnly(task.dueDate)} onChange={(event) => updateTask(task.id, { dueDate: event.target.value })} /></label>
                    <label className="space-y-2"><span className="label">Status</span><select className="input" value={task.status} onChange={(event) => updateTask(task.id, { status: event.target.value })}>{statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
                    <button type="button" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white" onClick={() => updateTask(task.id, { status: "APPROVED" })}>Approve draft</button>
                    <button type="button" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700" onClick={() => openOutreach(task.leadId)}>Open outreach</button>
                  </div>
                </div>
              </article>
            );
          }) : <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">No tasks match this filter.</div>}
        </div>
      </section>
    </div>
  );
}
