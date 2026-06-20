"use client";

import { useMemo, useState } from "react";
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
  currentRecoveryRate: 20,
  adminMinutesPerCancellation: 12,
  documentationCleanupFrequency: "sometimes",
  recoveryWorkflowMaturity: "manual",
  contactName: "",
  role: "",
  clinicName: "",
  email: "",
  currentEmr: "",
  consentToContact: false
};

export function LostHoursCalculator() {
  const [input, setInput] = useState<CalculatorInput>(initialInput);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        body: JSON.stringify(input)
      });
      if (!response.ok) throw new Error("Report request failed");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Report request failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
      <section className="card">
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-5">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">Estimate inputs</p>
          <h2 className="text-2xl font-black text-slate-950">Find your weekly lost-hours baseline</h2>
          <p className="text-sm leading-6 text-slate-500">
            Do not enter patient names or PHI. Use clinic-level operating estimates only.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <NumberField label="ABA clients served" value={input.clients} min={1} onChange={(v) => update("clients", v)} />
          <NumberField label="Sessions per client per week" value={input.sessionsPerClientPerWeek} min={0} step={0.5} onChange={(v) => update("sessionsPerClientPerWeek", v)} />
          <NumberField label="Average session length" suffix="hours" value={input.sessionLengthHours} min={0.25} step={0.25} onChange={(v) => update("sessionLengthHours", v)} />
          <NumberField label="Cancellation rate" suffix="%" value={input.cancellationRate} min={0} max={100} onChange={(v) => update("cancellationRate", v)} />
          <NumberField label="RBT callout rate" suffix="%" value={input.calloutRate} min={0} max={100} onChange={(v) => update("calloutRate", v)} />
          <NumberField label="Reimbursement per hour" prefix="$" value={input.reimbursementPerHour} min={0} onChange={(v) => update("reimbursementPerHour", v)} />
          <NumberField label="Current makeup/recovery rate" suffix="%" value={input.currentRecoveryRate} min={0} max={100} onChange={(v) => update("currentRecoveryRate", v)} />
          <NumberField label="Admin minutes per cancellation" value={input.adminMinutesPerCancellation} min={0} onChange={(v) => update("adminMinutesPerCancellation", v)} />

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

          <label className="space-y-2">
            <span className="label">Formal recovery workflow</span>
            <select
              className="input"
              value={input.recoveryWorkflowMaturity}
              onChange={(event) => update("recoveryWorkflowMaturity", event.target.value as CalculatorInput["recoveryWorkflowMaturity"])}
            >
              <option value="none">None</option>
              <option value="manual">Manual</option>
              <option value="partial">Partial</option>
              <option value="automated">Automated</option>
            </select>
          </label>
        </div>

        <div className="mt-8 rounded-3xl bg-slate-50 p-5">
          <p className="text-sm font-black text-slate-950">Request detailed report</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            The summary above is instant. The detailed report capture is optional and requires explicit consent.
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
          <button
            type="button"
            onClick={requestReport}
            className="mt-5 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Saving..." : "Send detailed report"}
          </button>
          {saved ? <p className="mt-3 text-sm font-semibold text-emerald-700">Report request saved. A follow-up task was created if the database is connected.</p> : null}
          {error ? <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p> : null}
        </div>
      </section>

      <CalculatorResults result={result} />
    </div>
  );
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
  return (
    <label className="space-y-2">
      <span className="label">{label}</span>
      <div className="relative">
        {prefix ? <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">{prefix}</span> : null}
        <input
          type="number"
          className={`input ${prefix ? "pl-8" : ""} ${suffix ? "pr-16" : ""}`}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(Number(event.target.value))}
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
    { label: "Weekly hours at risk", value: number(result.hoursAtRiskPerWeek) },
    { label: "Monthly hours at risk", value: number(result.monthlyHoursAtRisk) },
    { label: "Monthly revenue leakage", value: currency(result.monthlyRevenueLeakage) },
    { label: "Admin hours spent", value: number(result.adminHoursSpent) }
  ];

  return (
    <aside className="space-y-5">
      <div className="card bg-slate-950 text-white">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">Instant summary</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight">{number(result.hoursAtRiskPerWeek)} weekly hours at risk</h2>
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
        <h3 className="text-lg font-black text-slate-950">Potential additional recovered hours</h3>
        <div className="mt-5 space-y-4">
          <RecoveryBar label="10% workflow lift" value={result.potentialRecoveredHours10} max={result.potentialRecoveredHours30} />
          <RecoveryBar label="20% workflow lift" value={result.potentialRecoveredHours20} max={result.potentialRecoveredHours30} />
          <RecoveryBar label="30% workflow lift" value={result.potentialRecoveredHours30} max={result.potentialRecoveredHours30} />
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-black text-slate-950">Suggested bottleneck</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{result.suggestedBottleneck}</p>
        <h4 className="mt-6 text-sm font-black uppercase tracking-wide text-slate-400">Recommended module path</h4>
        <div className="mt-3 flex flex-wrap gap-2">
          {result.recommendedModules.map((module) => (
            <span key={module} className="badge bg-slate-50">
              {module}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}

function RecoveryBar({ label, value, max }: { label: string; value: number; max: number }) {
  const width = max > 0 ? `${Math.min(100, (value / max) * 100)}%` : "0%";
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="font-black text-slate-950">{number(value)} hrs/wk</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-slate-950" style={{ width }} />
      </div>
    </div>
  );
}
