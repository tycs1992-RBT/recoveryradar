"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calculateLostHours,
  calculatorInputSchema,
  type CalculatorInput,
  type CalculatorResult
} from "@/lib/calculator";
import { currency, number } from "@/lib/utils";

const initialInput: CalculatorInput = {
  clients: 50,
  sessionsPerClientPerWeek: 2,
  sessionLengthHours: 1.5,
  cancellationRate: 15,
  calloutRate: 8,
  reimbursementPerHour: 75,
  adminMinutesPerCancellation: 12,
  documentationCleanupFrequency: "sometimes",
  lateNoteRate: 0,
  contactName: "",
  role: "",
  clinicName: "",
  email: "",
  currentEmr: "",
  consentToContact: false
};

function htmlEscape(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function buildReportHtml(input: CalculatorInput, result: CalculatorResult) {
  const generatedAt = new Date().toLocaleString();
  const rows = [
    ["ABA clients served", input.clients],
    ["Sessions per client/week", input.sessionsPerClientPerWeek],
    ["Average session length", `${input.sessionLengthHours} hours`],
    ["Cancellation rate", `${input.cancellationRate}%`],
    ["RBT callout rate", `${input.calloutRate}%`],
    ["Collected rate per hour", currency(input.reimbursementPerHour)],
    ["Admin minutes per cancellation", input.adminMinutesPerCancellation],
    ["Documentation cleanup", input.documentationCleanupFrequency],
    ["Current EMR", input.currentEmr || "Not provided"]
  ];
  const metrics = [
    ["Weekly billable hours lost", number(result.hoursAtRiskPerWeek)],
    ["Weekly revenue lost", currency(result.weeklyRevenueAtRisk)],
    ["Monthly revenue lost", currency(result.monthlyRevenueLeakage)],
    ["Annual revenue lost", currency(result.annualRevenueLeakage)],
    ["Admin hours lost / week", number(result.adminHoursSpent)],
    ["At-risk billing / month (late notes)", currency(result.atRiskClaimDollarsMonthly)]
  ];

  return `<!doctype html><html><head><meta charset="utf-8" /><title>Infinite Pieces — Lost Hours Report</title><style>body{font-family:Arial,sans-serif;color:#0f172a;padding:32px;line-height:1.55}h1{font-size:30px;margin-bottom:6px}.eyebrow{font-weight:800;text-transform:uppercase;letter-spacing:.18em;color:#0891b2;font-size:12px}.box{border:1px solid #e2e8f0;border-radius:18px;padding:18px;margin:18px 0}.dark{background:#0f172a;color:#fff}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}table{width:100%;border-collapse:collapse;font-size:13px}td,th{border:1px solid #e2e8f0;padding:8px;text-align:left;vertical-align:top}th{background:#f8fafc}.cta{background:#ecfeff;border:1px solid #a5f3fc;border-radius:18px;padding:18px;margin-top:18px}</style></head><body><p class="eyebrow">Infinite Pieces AI · Lost Hours Calculator</p><h1>How much your clinic is losing to unrecovered hours.</h1><p>Generated ${htmlEscape(generatedAt)}. This report uses clinic-level estimates only and should not include PHI.</p><div class="box dark"><h2>${currency(result.annualRevenueLeakage)} a year in unrecovered hours</h2><p>${htmlEscape(result.summary)}</p></div><div class="grid"><div class="box"><h2>Clinic-level assumptions</h2><table>${rows.map(([label, value]) => `<tr><th>${htmlEscape(label)}</th><td>${htmlEscape(value)}</td></tr>`).join("")}</table></div><div class="box"><h2>What you're losing</h2><table>${metrics.map(([label, value]) => `<tr><th>${htmlEscape(label)}</th><td>${htmlEscape(value)}</td></tr>`).join("")}</table></div></div><div class="cta"><h2>These are clinic-level operating estimates.</h2><p>No-PHI disclaimer: do not submit patient names, dates of birth, insurance IDs, treatment notes or clinical details. These are clinic-level operating estimates, not a payer, billing, legal or compliance guarantee.</p></div></body></html>`;
}

function buildEmailReport(input: CalculatorInput, result: CalculatorResult) {
  return [
    "Subject: How much your ABA clinic is losing to unrecovered hours",
    "",
    "How much your clinic is losing to unrecovered hours.",
    "",
    `Clinic: ${input.clinicName || "Not provided"}`,
    `Current EMR: ${input.currentEmr || "Not provided"}`,
    `Weekly billable hours lost: ${number(result.hoursAtRiskPerWeek)}`,
    `Weekly revenue lost: ${currency(result.weeklyRevenueAtRisk)}`,
    `Monthly revenue lost: ${currency(result.monthlyRevenueLeakage)}`,
    `Annual revenue lost: ${currency(result.annualRevenueLeakage)}`,
    `Admin hours lost / week: ${number(result.adminHoursSpent)}`,
    "",
    "That's the bleed. See how much of it you could recover:",
    "These are clinic-level operating estimates, not a payer, billing, legal or compliance guarantee.",
    "",
    "No-PHI disclaimer: this report uses clinic-level estimates only and is not a billing, payer, legal or compliance guarantee."
  ].join("\n");
}

export function LostHoursCalculator() {
  const [input, setInput] = useState<CalculatorInput>(initialInput);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [botTrap, setBotTrap] = useState("");

  const result = useMemo(() => calculateLostHours(input), [input]);

  function update<K extends keyof CalculatorInput>(key: K, value: CalculatorInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function requestReport() {
    setSaving(true);
    setError(null);
    const parsed = calculatorInputSchema.safeParse(input);
    if (!parsed.success) {
      setError("Please check the form. Email is required when requesting a detailed report.");
      setSaving(false);
      return;
    }
    if (!input.email || !input.consentToContact) {
      setError("Add an email and confirm consent before requesting the detailed report.");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, companyWebsiteHidden: botTrap })
      });
      if (!response.ok) throw new Error("Report request failed");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Report request failed");
    } finally {
      setSaving(false);
    }
  }

  function downloadReport() {
    downloadBlob("infinite-pieces-lost-hours-report.html", buildReportHtml(input, result), "text/html;charset=utf-8");
  }

  async function copyEmailReport() {
    await navigator.clipboard.writeText(buildEmailReport(input, result));
    setSaved(true);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
      <section className="card">
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-5">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">Your numbers</p>
          <h2 className="text-2xl font-black text-slate-950">See how much your clinic is losing on unrecovered hours</h2>
          <p className="text-sm leading-6 text-slate-500">
            Every input below is a number you already know. Do not enter patient names or PHI — clinic-level operating estimates only.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <NumberField label="ABA clients served" value={input.clients} min={1} onChange={(v) => update("clients", v)} />
          <NumberField label="Sessions per client per week" value={input.sessionsPerClientPerWeek} min={0} step={0.5} onChange={(v) => update("sessionsPerClientPerWeek", v)} />
          <NumberField label="Average session length" suffix="hours" value={input.sessionLengthHours} min={0.25} step={0.25} onChange={(v) => update("sessionLengthHours", v)} />
          <NumberField label="Cancellation rate" suffix="%" value={input.cancellationRate} min={0} max={100} onChange={(v) => update("cancellationRate", v)} />
          <NumberField label="RBT callout rate" suffix="%" value={input.calloutRate} min={0} max={100} onChange={(v) => update("calloutRate", v)} />
          <NumberField label="Collected rate per hour" prefix="$" value={input.reimbursementPerHour} min={0} onChange={(v) => update("reimbursementPerHour", v)} />
          <NumberField label="Admin minutes per cancellation" value={input.adminMinutesPerCancellation} min={0} onChange={(v) => update("adminMinutesPerCancellation", v)} />
          <NumberField label="Late/missing note rate" suffix="%" value={input.lateNoteRate ?? 0} min={0} max={100} onChange={(v) => update("lateNoteRate", v)} />

          <label className="space-y-2">
            <span className="label">Documentation cleanup frequency</span>
            <select
              className="input"
              value={input.documentationCleanupFrequency}
              onChange={(event) => update("documentationCleanupFrequency", event.target.value as CalculatorInput["documentationCleanupFrequency"])}
            >
              <option value="rarely">Rarely</option>
              <option value="sometimes">Sometimes</option>
              <option value="often">Often</option>
            </select>
          </label>
        </div>

        <input className="hidden" tabIndex={-1} autoComplete="off" value={botTrap} onChange={(event) => setBotTrap(event.target.value)} aria-hidden="true" />

        <div className="mt-8 rounded-3xl bg-slate-50 p-5">
          <p className="text-sm font-black text-slate-950">Email me the full breakdown</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            The summary on the right is instant. The detailed report is optional and requires explicit consent.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField label="Name" value={input.contactName ?? ""} onChange={(v) => update("contactName", v)} />
            <TextField label="Role" value={input.role ?? ""} onChange={(v) => update("role", v)} />
            <TextField label="Clinic" value={input.clinicName ?? ""} onChange={(v) => update("clinicName", v)} />
            <TextField label="Email" type="email" value={input.email ?? ""} onChange={(v) => update("email", v)} />
            <TextField label="Current EMR" value={input.currentEmr ?? ""} onChange={(v) => update("currentEmr", v)} />
          </div>
          <label className="mt-4 flex gap-3 text-sm leading-6 text-slate-600">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300"
              checked={input.consentToContact}
              onChange={(event) => update("consentToContact", event.target.checked)}
            />
            <span>
              I agree that Infinite Pieces AI may contact me about Infinite Suite OS™. I understand this calculator provides estimates, not guarantees, and I will not submit patient information.
            </span>
          </label>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={requestReport}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Saving..." : "Send detailed report"}
            </button>
            <button type="button" onClick={downloadReport} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800">
              Download report
            </button>
            <button type="button" onClick={copyEmailReport} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800">
              Copy email report
            </button>
          </div>
          {saved ? <p className="mt-3 text-sm font-semibold text-emerald-700">Report action complete. Review before sending. A follow-up task was created if the database is connected.</p> : null}
          {error ? <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p> : null}
        </div>
      </section>

      <CalculatorResults result={result} />
    </div>
  );
}

function normalizeNumberDraft(value: number) {
  return Number.isFinite(value) ? String(value) : "";
}

function clampNumber(value: number, min?: number, max?: number) {
  let next = value;
  if (typeof min === "number" && next < min) next = min;
  if (typeof max === "number" && next > max) next = max;
  return next;
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [draft, setDraft] = useState(() => normalizeNumberDraft(value));

  useEffect(() => {
    setDraft(normalizeNumberDraft(value));
  }, [value]);

  function commitDraft(rawDraft = draft) {
    const trimmed = rawDraft.trim();
    if (!trimmed) {
      const fallback = typeof min === "number" ? min : 0;
      setDraft(normalizeNumberDraft(fallback));
      onChange(fallback);
      return;
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) {
      setDraft(normalizeNumberDraft(value));
      return;
    }

    const clamped = clampNumber(parsed, min, max);
    setDraft(normalizeNumberDraft(clamped));
    onChange(clamped);
  }

  return (
    <label className="space-y-2">
      <span className="label">{label}</span>
      <div className="relative">
        {prefix ? <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">{prefix}</span> : null}
        <input
          type="number"
          inputMode="decimal"
          className={`input ${prefix ? "pl-8" : ""} ${suffix ? "pr-16" : ""}`}
          value={draft}
          min={min}
          max={max}
          step={step}
          onChange={(event) => {
            const raw = event.target.value;
            setDraft(raw);
            if (raw.trim() === "" || raw === "-" || raw === ".") return;
            const parsed = Number(raw);
            if (Number.isFinite(parsed)) onChange(parsed);
          }}
          onBlur={() => commitDraft()}
        />
        {suffix ? <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">{suffix}</span> : null}
      </div>
    </label>
  );
}

function TextField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="space-y-2">
      <span className="label">{label}</span>
      <input type={type} className="input" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function CalculatorResults({ result }: { result: CalculatorResult }) {
  const metrics = [
    { label: "Weekly billable hours lost", value: number(result.hoursAtRiskPerWeek) },
    { label: "Weekly revenue lost", value: currency(result.weeklyRevenueAtRisk) },
    { label: "Monthly revenue lost", value: currency(result.monthlyRevenueLeakage) },
    { label: "Admin hours lost / week", value: number(result.adminHoursSpent) }
  ];

  return (
    <aside className="space-y-5">
      <div className="card bg-slate-950 text-white">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">What you&rsquo;re losing</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-rose-300">{currency(result.annualRevenueLeakage)}<span className="text-lg font-bold text-slate-400"> / year</span></h2>
        <p className="mt-2 text-sm font-semibold text-slate-300">in unrecovered billable hours</p>
        <p className="mt-4 text-sm leading-6 text-slate-300">{result.summary}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-3xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{metric.label}</p>
            <p className="mt-2 text-2xl font-black text-slate-950">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="text-lg font-black text-slate-950">Billing at risk from late notes</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">Late and missing notes put billable dollars at denial/recoupment risk — a separate leak from cancelled sessions.</p>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">At-risk billing / month</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{currency(result.atRiskClaimDollarsMonthly)}</p>
        </div>
        <p className="mt-3 text-xs font-semibold text-slate-400">Illustrative; validate against your payer mix. This sizes the exposure — it does not assume any tool fixes it.</p>
      </div>
    </aside>
  );
}
