"use client";

import { useMemo, useState } from "react";
import { mockLeads, type MockLead } from "@/lib/mock-data";
import { ScorePill } from "@/components/ui/ScorePill";
import { ScoreReasonsPanel } from "@/components/leads/ScoreReasonsPanel";
import { scoreReasonsForDisplay } from "@/lib/score-reasons-ui";

const columns = [
  { key: "new", label: "New leads" },
  { key: "research", label: "Research" },
  { key: "connection_requested", label: "Connection requested" },
  { key: "demo_booked", label: "Demo booked" },
  { key: "beta_candidate", label: "Beta candidates" },
  { key: "nurture", label: "Nurture" }
];

const taskTypes = [
  { value: "CONNECTION_NOTE", label: "Connection note" },
  { value: "INMAIL", label: "LinkedIn InMail" },
  { value: "EMAIL_FOLLOWUP", label: "Email follow-up" },
  { value: "CALL", label: "Call" }
] as const;

function defaultDueDate(daysFromNow = 3) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

function getTier(score: number) {
  if (score >= 60) return "hot";
  if (score >= 30) return "research";
  return "low";
}

function tierLabel(score: number) {
  const tier = getTier(score);
  if (tier === "hot") return "Hot";
  if (tier === "research") return "Research";
  return "Low";
}

function cardClass(score: number) {
  const base = "rounded-2xl bg-white p-4 shadow-sm border-l-4";
  const tier = getTier(score);
  if (tier === "hot") return `${base} border-red-500`;
  if (tier === "research") return `${base} border-yellow-500`;
  return `${base} border-slate-300`;
}

function tierTextClass(score: number) {
  const tier = getTier(score);
  if (tier === "hot") return "text-xs font-black text-red-600";
  if (tier === "research") return "text-xs font-black text-yellow-600";
  return "text-xs font-black text-slate-500";
}

function crmScoreReasons(lead: MockLead) {
  return scoreReasonsForDisplay({
    companyName: lead.companyName,
    contactRole: lead.contactRole,
    clinicSize: lead.clinicSize,
    serviceModel: lead.serviceModel,
    status: lead.status,
    painPoint: lead.painPoint,
    snippet: lead.nextStep
  });
}

export function CRMBoard() {
  const [leads, setLeads] = useState<MockLead[]>(mockLeads);
  const [dueDates, setDueDates] = useState<Record<string, string>>(() => Object.fromEntries(mockLeads.map((lead) => [lead.id, defaultDueDate(3)])));
  const [selectedTaskTypes, setSelectedTaskTypes] = useState<Record<string, string>>(() => Object.fromEntries(mockLeads.map((lead) => [lead.id, "CONNECTION_NOTE"])));
  const [notification, setNotification] = useState("CRM ready. Lead cards now show deterministic score reasons before outreach.");

  const grouped = useMemo(() => columns.map((column) => ({ ...column, leads: leads.filter((lead) => lead.status === column.key) })), [leads]);

  const pipelineMetrics = useMemo(() => {
    const hot = leads.filter((lead) => lead.leadScore >= 60).length;
    const research = leads.filter((lead) => lead.leadScore >= 30 && lead.leadScore < 60).length;
    const averageScore = leads.length ? Math.round(leads.reduce((sum, lead) => sum + lead.leadScore, 0) / leads.length) : 0;
    return { hot, research, averageScore };
  }, [leads]);

  function updateStatus(id: string, status: string) {
    setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, status } : lead)));
    setNotification("Lead status updated locally. Connect Postgres to persist pipeline moves.");
  }

  async function assignTask(lead: MockLead) {
    const taskType = selectedTaskTypes[lead.id] ?? "CONNECTION_NOTE";
    const dueDate = dueDates[lead.id] ?? defaultDueDate(3);

    try {
      const response = await fetch("/api/outreach-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          taskType,
          dueDate,
          assignedTo: "Ty | Infinite Pieces AI",
          generatedMessage: `Draft ${taskType.replaceAll("_", " ").toLowerCase()} for ${lead.companyName}. Core angle: keep your current EMR, add recovery beside it.`
        })
      });
      const data = (await response.json()) as { notification?: string; error?: string };

      if (!response.ok) {
        setNotification(data.error ?? "Task creation failed.");
        return;
      }

      setLeads((prev) => prev.map((item) => (item.id === lead.id ? { ...item, status: "connection_requested", nextStep: "Draft outreach and review before sending" } : item)));
      setNotification(`${data.notification ?? "Outreach task created."} ${lead.companyName} moved to connection requested.`);
    } catch {
      setNotification("Task creation failed. Check the local dev server and API route.");
    }
  }

  function openOutreach(id: string) {
    window.location.href = `/outreach?leadId=${id}`;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="card p-5"><p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Hot leads</p><p className="mt-2 text-3xl font-black text-red-600">{pipelineMetrics.hot}</p></div>
        <div className="card p-5"><p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Research leads</p><p className="mt-2 text-3xl font-black text-yellow-600">{pipelineMetrics.research}</p></div>
        <div className="card p-5"><p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Average score</p><p className="mt-2 text-3xl font-black text-slate-950">{pipelineMetrics.averageScore}</p></div>
      </section>

      <div className="flex flex-col gap-3 rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-blue-950 md:flex-row md:items-center md:justify-between"><span>{notification}</span><button type="button" className="rounded-full bg-blue-950 px-4 py-2 text-xs font-black text-white" onClick={() => { window.location.href = "/tasks"; }}>Open task inbox</button></div>

      <div className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-6">
        {grouped.map((column) => (
          <section key={column.key} className="rounded-3xl border border-slate-200 bg-slate-100/60 p-4">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-black text-slate-950">{column.label}</h2><span className="rounded-full bg-white px-2 py-1 text-xs font-black text-slate-500">{column.leads.length}</span></div>
            <div className="space-y-3">
              {column.leads.length ? column.leads.map((lead) => {
                const score = crmScoreReasons(lead);
                return (
                  <article key={lead.id} className={cardClass(lead.leadScore)}>
                    <div className="flex items-start justify-between gap-3"><div><p className="font-black text-slate-950">{lead.companyName}</p><p className="mt-1 text-xs text-slate-500">{lead.contactRole ?? "Research role"} · {lead.state}</p></div><div className="flex flex-col items-end gap-1"><ScorePill score={lead.leadScore} /><span className={tierTextClass(lead.leadScore)}>{tierLabel(lead.leadScore)}</span></div></div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{lead.nextStep ?? lead.painPoint}</p>
                    <ScoreReasonsPanel result={{ ...score, score: lead.leadScore, tier: getTier(lead.leadScore) }} />
                    <div className="mt-4 space-y-3"><select className="input py-2 text-xs" value={lead.status} onChange={(event) => updateStatus(lead.id, event.target.value)}>{columns.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}</select><label className="block space-y-1"><span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Task type</span><select className="input py-2 text-xs" value={selectedTaskTypes[lead.id] ?? "CONNECTION_NOTE"} onChange={(event) => setSelectedTaskTypes((prev) => ({ ...prev, [lead.id]: event.target.value }))}>{taskTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label className="block space-y-1"><span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Due date</span><input type="date" className="input py-2 text-xs" value={dueDates[lead.id] ?? defaultDueDate(3)} onChange={(event) => setDueDates((prev) => ({ ...prev, [lead.id]: event.target.value }))} /></label><div className="grid gap-2"><button type="button" className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white" onClick={() => assignTask(lead)}>Create task</button><button type="button" className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black text-slate-700" onClick={() => openOutreach(lead.id)}>Draft outreach</button></div></div>
                  </article>
                );
              }) : <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">No leads yet</div>}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
