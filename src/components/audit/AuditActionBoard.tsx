"use client";

import Link from "next/link";
import { useState } from "react";
import { auditSuggestions, type AuditSuggestion } from "@/lib/audit-suggestions";

const statusStyles = {
  implemented: "bg-emerald-50 text-emerald-700 border-emerald-100",
  scaffolded: "bg-amber-50 text-amber-700 border-amber-100",
  recommended: "bg-sky-50 text-sky-700 border-sky-100"
};

const priorityStyles = {
  High: "bg-rose-50 text-rose-700 border-rose-100",
  Medium: "bg-indigo-50 text-indigo-700 border-indigo-100",
  Low: "bg-slate-50 text-slate-700 border-slate-100"
};

const routeMap: Record<string, { href: string; docs: string; prompt: string }> = {
  "Keep the fuller App Router repository as the source of truth": {
    href: "/dashboard",
    docs: "https://github.com/tycs1992-RBT/recoveryradar/blob/main/README.md",
    prompt: "Continue from the fuller App Router Recovery Radar repository. Do not restart from the Pages Router prototype. Preserve App Router routes, API endpoints, Prisma, consent/audit models, deterministic bot flows, lead scoring, seed data, tests, docs and CI."
  },
  "Use deterministic lead scoring with visible reasons": {
    href: "/crm",
    docs: "https://github.com/tycs1992-RBT/recoveryradar/blob/main/src/lib/lead-scoring.ts",
    prompt: "Expose deterministic lead score reasons in CRM, Lead Finder, Intelligence Bank, Executive Prospector and Task Inbox. Re-score leads when new intent signals are attached. Show score, tier and all point modifiers."
  },
  "Keep the chatbot as a state machine before adding open-ended AI": {
    href: "/bot-builder",
    docs: "https://github.com/tycs1992-RBT/recoveryradar/blob/main/src/lib/bot-flows.ts",
    prompt: "Keep Recovery Advisor button-led and state-machine-first. Add admin-editable flows only after PHI safeguards, prompt-injection controls and no-clinical-advice guardrails are reviewed."
  },
  "Add production-grade public form protection": {
    href: "/calculator",
    docs: "https://github.com/tycs1992-RBT/recoveryradar/blob/main/src/lib/public-endpoint-protection.ts",
    prompt: "Harden public calculator, quiz and chatbot endpoints with rate limits, honeypot bot traps, validation monitoring, consent text versioning, request metadata logging and public endpoint error telemetry."
  },
  "Preserve human approval for outreach": {
    href: "/outreach-approval",
    docs: "https://github.com/tycs1992-RBT/recoveryradar/blob/main/docs/OUTREACH_DELIVERABILITY_PLAYBOOK.md",
    prompt: "Create a manual outreach approval queue. No auto-send. Drafts must show source URL, lead, company, current EMR, pain signal, generated message, reviewer, review timestamp and Copy approved message button. Enforce do-not-contact suppression."
  },
  "Adopt Shadcn UI gradually": {
    href: "/settings",
    docs: "https://ui.shadcn.com/docs",
    prompt: "Adopt Shadcn UI gradually for high-touch forms, tables, tabs and dialogs after local install. Do not change product strategy. Prioritize accessibility and dashboard usability."
  },
  "Add PDF/email report generation for calculator leads": {
    href: "/calculator",
    docs: "https://github.com/tycs1992-RBT/recoveryradar/blob/main/src/components/calculator/LostHoursCalculator.tsx",
    prompt: "Add polished calculator report generation with clinic-level assumptions, lost hours, revenue leakage, admin time, current recovery rate, recommended modules, no-PHI disclaimer, before-switching-EMRs CTA and Provider Portal CTA."
  },
  "Add CRM import/export mappings": {
    href: "/crm-import",
    docs: "https://github.com/tycs1992-RBT/recoveryradar/blob/main/docs/INTELLIGENCE_BANK.md",
    prompt: "Build CRM import/export mapping screen with CSV upload, column mapping, duplicate preview, do-not-contact detection, current EMR, source URL, social URL fields, lead score preview and import confirmation."
  },
  "Use AI for content drafts and signal suggestions, not final decisions": {
    href: "/content-generator",
    docs: "https://github.com/tycs1992-RBT/recoveryradar/blob/main/src/app/api/content/route.ts",
    prompt: "Add approval metadata to AI-generated content and signal suggestions: generatedBy, model, prompt version, createdAt, reviewedBy, reviewedAt, approvalStatus and finalHumanEditedText. Humans make final compliance-sensitive decisions."
  }
};

function actionConfig(item: AuditSuggestion) {
  return routeMap[item.title] ?? {
    href: "/dashboard",
    docs: "https://github.com/tycs1992-RBT/recoveryradar",
    prompt: `Implement this audit recommendation: ${item.title}. Next step: ${item.nextStep}`
  };
}

export function AuditActionBoard() {
  const [notification, setNotification] = useState("Audit command center ready. Use actions to route work, copy prompts and log tasks.");
  const [localPriorities, setLocalPriorities] = useState<Record<string, "High" | "Medium" | "Low">>({});

  async function logAction(item: AuditSuggestion, actionType: "create_task" | "mark_priority" | "copy_prompt" | "open_docs" | "open_page") {
    const config = actionConfig(item);
    try {
      const response = await fetch("/api/audit-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title,
          actionType,
          priority: localPriorities[item.title] ?? item.priority,
          relatedHref: config.href,
          docsHref: config.docs,
          prompt: config.prompt
        })
      });
      const data = await response.json();
      setNotification(data.notification ?? "Audit action logged.");
    } catch {
      setNotification("Audit action captured locally. Connect the database to persist action logs.");
    }
  }

  async function copyPrompt(item: AuditSuggestion) {
    const config = actionConfig(item);
    await navigator.clipboard.writeText(config.prompt);
    await logAction(item, "copy_prompt");
    setNotification(`Copied implementation prompt for: ${item.title}`);
  }

  function markPriority(item: AuditSuggestion) {
    const current = localPriorities[item.title] ?? item.priority;
    const next = current === "High" ? "Medium" : current === "Medium" ? "Low" : "High";
    setLocalPriorities((prev) => ({ ...prev, [item.title]: next }));
    logAction({ ...item, priority: next }, "mark_priority");
    setNotification(`${item.title} marked ${next}.`);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-blue-950">{notification}</div>
      {auditSuggestions.map((item) => {
        const config = actionConfig(item);
        const priority = localPriorities[item.title] ?? item.priority;
        return (
          <article key={item.title} className="card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950">{item.title}</h2>
                <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">{item.rationale}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${priorityStyles[priority]}`}>{priority}</span>
                <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${statusStyles[item.status]}`}>{item.status}</span>
              </div>
            </div>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              <strong className="text-slate-950">Next step:</strong> {item.nextStep}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Link href={config.href} onClick={() => logAction(item, "open_page")} className="rounded-full bg-slate-950 px-4 py-3 text-center text-xs font-black text-white">Open related page</Link>
              <button type="button" onClick={() => logAction(item, "create_task")} className="rounded-full border border-slate-200 px-4 py-3 text-xs font-black text-slate-700">Create task</button>
              <button type="button" onClick={() => markPriority(item)} className="rounded-full border border-slate-200 px-4 py-3 text-xs font-black text-slate-700">Mark priority</button>
              <button type="button" onClick={() => copyPrompt(item)} className="rounded-full border border-slate-200 px-4 py-3 text-xs font-black text-slate-700">Copy implementation prompt</button>
              <a href={config.docs} target="_blank" rel="noreferrer" onClick={() => logAction(item, "open_docs")} className="rounded-full border border-slate-200 px-4 py-3 text-center text-xs font-black text-slate-700">Open docs</a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
