"use client";

import { useEffect, useMemo, useState } from "react";
import { mockLeads } from "@/lib/mock-data";
import { complianceChecklist, mergeTemplate, outreachTemplates } from "@/lib/outreach";

function defaultDueDate(daysFromNow = 3) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

function taskTypeFromChannel(channel: string) {
  if (channel === "email") return "EMAIL_FOLLOWUP";
  if (channel === "LinkedIn_inmail") return "INMAIL";
  return "CONNECTION_NOTE";
}

export function OutreachWorkbench() {
  const [leadId, setLeadId] = useState(mockLeads[0]?.id ?? "");
  const [templateName, setTemplateName] = useState(outreachTemplates[0]?.templateName ?? "");
  const [senderName, setSenderName] = useState("Ty | Infinite Pieces AI");
  const [physicalAddress, setPhysicalAddress] = useState("[physical address]");
  const [dueDate, setDueDate] = useState(defaultDueDate(3));
  const [notification, setNotification] = useState("Draft outreach, then create a manual approval task before sending.");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const leadIdFromUrl = params.get("leadId");
    if (leadIdFromUrl && mockLeads.some((lead) => lead.id === leadIdFromUrl)) setLeadId(leadIdFromUrl);
  }, []);

  const lead = mockLeads.find((item) => item.id === leadId) ?? mockLeads[0];
  const template = outreachTemplates.find((item) => item.templateName === templateName) ?? outreachTemplates[0];
  const merged = useMemo(() => mergeTemplate(template.body, lead, senderName, physicalAddress), [template.body, lead, senderName, physicalAddress]);
  const checklist = complianceChecklist(template.channel);
  const characterCount = merged.length;
  const overLimit = template.maxLength ? characterCount > template.maxLength : false;

  async function createApprovalTask() {
    try {
      const response = await fetch("/api/outreach-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, taskType: taskTypeFromChannel(template.channel), dueDate, assignedTo: senderName, generatedMessage: merged })
      });
      const data = (await response.json()) as { notification?: string; error?: string };
      setNotification(response.ok ? data.notification ?? "Approval task created." : data.error ?? "Could not create approval task.");
    } catch {
      setNotification("Could not create approval task. Check the local API route and database configuration.");
    }
  }

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(merged);
      setNotification("Draft copied. Keep the message manually reviewed and respect opt-outs.");
    } catch {
      setNotification("Copy failed. You can still select the text manually.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="card">
        <h2 className="text-2xl font-black text-slate-950">Template library</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Merge a lead into an approved template, choose a due date, and create a review task in the Task Inbox.</p>
        <div className="mt-6 space-y-4">
          <label className="space-y-2 block"><span className="label">Lead</span><select className="input" value={leadId} onChange={(event) => setLeadId(event.target.value)}>{mockLeads.map((item) => <option key={item.id} value={item.id}>{item.companyName} · {item.contactRole ?? "Research"}</option>)}</select></label>
          <label className="space-y-2 block"><span className="label">Template</span><select className="input" value={templateName} onChange={(event) => setTemplateName(event.target.value)}>{outreachTemplates.map((item) => <option key={item.templateName} value={item.templateName}>{item.templateName}</option>)}</select></label>
          <label className="space-y-2 block"><span className="label">Due date for approval task</span><input type="date" className="input" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label>
          <label className="space-y-2 block"><span className="label">Sender name</span><input className="input" value={senderName} onChange={(event) => setSenderName(event.target.value)} /></label>
          <label className="space-y-2 block"><span className="label">Physical address merge field</span><input className="input" value={physicalAddress} onChange={(event) => setPhysicalAddress(event.target.value)} /></label>
        </div>
        <div className="mt-8 rounded-3xl bg-slate-50 p-5"><h3 className="font-black text-slate-950">Manual approval checklist</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">{checklist.map((item) => <li key={item}>• {item}</li>)}</ul></div>
      </section>

      <section className="card">
        <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">Draft preview</p><h2 className="mt-2 text-2xl font-black text-slate-950">{template.channel}</h2><p className={`mt-2 text-sm font-bold ${overLimit ? "text-red-600" : "text-slate-500"}`}>{characterCount}{template.maxLength ? ` / ${template.maxLength}` : ""} characters</p></div><span className="badge">Human review required</span></div>
        <textarea readOnly value={merged} className="mt-6 h-[520px] w-full resize-none rounded-3xl border border-slate-200 bg-slate-50 p-5 font-mono text-sm leading-6 text-slate-800" />
        <div className="mt-4 rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-blue-950">{notification}</div>
        <div className="mt-4 flex flex-wrap gap-3"><button type="button" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white" onClick={createApprovalTask}>Create approval task</button><button type="button" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700" onClick={copyDraft}>Copy draft</button><button type="button" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700" onClick={() => { window.location.href = "/tasks"; }}>Open task inbox</button></div>
      </section>
    </div>
  );
}
