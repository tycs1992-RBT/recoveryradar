"use client";

import { useState } from "react";

type WalkthroughRequestResponse = {
  ok?: boolean;
  emailed?: boolean;
  persisted?: boolean;
  taskCreated?: boolean;
  leadScore?: number;
  mailtoHref?: string;
  message?: string;
  error?: string;
};

const painOptions = [
  "Cancellations",
  "RBT callouts",
  "Caregiver communication",
  "Documentation cleanup",
  "Authorization tracking"
];

export function WalkthroughRequestForm({ pageSlug, formTitle }: { pageSlug: string; formTitle: string }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [clinic, setClinic] = useState("");
  const [email, setEmail] = useState("");
  const [currentEmr, setCurrentEmr] = useState("");
  const [pain, setPain] = useState("Cancellations");
  const [consent, setConsent] = useState(false);
  const [companyWebsiteHidden, setCompanyWebsiteHidden] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [fallbackMailto, setFallbackMailto] = useState("");

  async function submit() {
    setLoading(true);
    setNotice("");
    setFallbackMailto("");

    try {
      const response = await fetch("/api/walkthrough-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, clinic, email, currentEmr, pain, pageSlug, consent, companyWebsiteHidden })
      });
      const data = (await response.json()) as WalkthroughRequestResponse;

      if (!response.ok) {
        setNotice(data.error ?? "Please check the form and try again.");
        return;
      }

      setNotice(data.message ?? "Walkthrough request received.");
      if (!data.emailed && data.mailtoHref) setFallbackMailto(data.mailtoHref);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Walkthrough request failed. Please email founders@infinitepieces.ai directly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5 grid gap-3">
      <input className="input" placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} />
      <input className="input" placeholder="Role" value={role} onChange={(event) => setRole(event.target.value)} />
      <input className="input" placeholder="Clinic" value={clinic} onChange={(event) => setClinic(event.target.value)} />
      <input className="input" placeholder="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      <input className="input" placeholder="Current EMR" value={currentEmr} onChange={(event) => setCurrentEmr(event.target.value)} />
      <select className="input" value={pain} onChange={(event) => setPain(event.target.value)} aria-label="Biggest operational pain">
        {painOptions.map((option) => <option key={option}>{option}</option>)}
      </select>
      <input className="hidden" tabIndex={-1} autoComplete="off" value={companyWebsiteHidden} onChange={(event) => setCompanyWebsiteHidden(event.target.value)} aria-hidden="true" />
      <label className="flex gap-3 text-sm leading-6 text-slate-600">
        <input type="checkbox" className="mt-1 h-4 w-4" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
        <span>I agree Infinite Pieces AI may contact me about Infinite Suite OS™. I will not submit patient information.</span>
      </label>
      <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-60" type="button" onClick={submit} disabled={loading}>
        {loading ? "Requesting..." : formTitle.toLowerCase().includes("walkthrough") ? "Request walkthrough" : "Request walkthrough"}
      </button>
      {notice ? <div className="rounded-2xl bg-blue-50 p-4 text-sm font-semibold leading-6 text-blue-950">{notice}</div> : null}
      {fallbackMailto ? (
        <a href={fallbackMailto} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-center text-sm font-black text-slate-800">
          Open fallback email draft
        </a>
      ) : null}
      <p className="text-xs leading-5 text-slate-400">This creates a walkthrough lead, a follow-up task, and sends a notification email when email delivery is configured.</p>
    </div>
  );
}
