"use client";

import { useEffect, useMemo, useState } from "react";

type BankRecord = {
  type?: string;
  name?: string | null;
  role?: string | null;
  companyName?: string | null;
  website?: string | null;
  linkedinUrl?: string | null;
  publicEmail?: string | null;
  phone?: string | null;
  sourceUrl?: string | null;
  cityState?: string | null;
  leadScore?: number | null;
  source?: string | null;
  updatedAt?: string | Date | null;
};

type BankResponse = {
  records?: BankRecord[];
  count?: number;
  error?: string;
};

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function downloadCsv(rows: BankRecord[]) {
  const headers = ["Type", "Name", "Role", "Company", "Website", "LinkedIn", "Email", "Phone", "City/State", "Lead Score", "Source"];
  const body = rows.map((row) => [row.type, row.name, row.role, row.companyName, row.website, row.linkedinUrl, row.publicEmail, row.phone, row.cityState, row.leadScore, row.source].map(csvEscape).join(","));
  const blob = new Blob([[headers.map(csvEscape).join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "recovery-radar-intelligence-bank.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function rowName(row: BankRecord) {
  return String(row.name || row.companyName || "").toLowerCase();
}

export function IntelligenceBank() {
  const [records, setRecords] = useState<BankRecord[]>([]);
  const [notice, setNotice] = useState("Loading Intelligence Bank...");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const query = filter.trim().toLowerCase();
    const rows = [...records].sort((a, b) => rowName(a).localeCompare(rowName(b)));
    if (!query) return rows;
    return rows.filter((row) => [row.name, row.companyName, row.role, row.website, row.linkedinUrl, row.publicEmail, row.cityState, row.source].some((value) => String(value ?? "").toLowerCase().includes(query)));
  }, [filter, records]);

  async function loadBank() {
    setLoading(true);
    try {
      const response = await fetch("/api/intelligence-bank", { cache: "no-store" });
      const data = (await response.json()) as BankResponse;
      if (!response.ok) throw new Error(data.error ?? "Failed to load Intelligence Bank");
      setRecords(data.records ?? []);
      setNotice(`Loaded ${data.count ?? data.records?.length ?? 0} deduped records. Results are alphabetized.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Failed to load Intelligence Bank");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBank();
  }, []);

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">No-duplicate master bank</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Intelligence Bank</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              This stores companies, contacts, executives, public emails, websites and source links gathered from Lead Machine, LinkedIn Prospector and CRM imports. Records are alphabetized and duplicate-checked by company name, website, public email and LinkedIn URL.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={loadBank} disabled={loading} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 disabled:opacity-60">{loading ? "Refreshing..." : "Refresh"}</button>
            <button type="button" onClick={() => downloadCsv(filtered)} disabled={!filtered.length} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-60">Export CSV</button>
          </div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
          <input className="input" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Search name, company, role, city, email, website..." />
          <span className="badge self-center">{filtered.length} visible</span>
        </div>
        <div className="mt-4 rounded-3xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">{notice}</div>
      </section>

      <section className="card min-w-0">
        <div className="overflow-x-auto rounded-3xl border border-slate-200">
          <table className="min-w-[1150px] w-full divide-y divide-slate-200 bg-white text-sm">
            <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Links</th>
                <th className="px-4 py-3">Email / Phone</th>
                <th className="px-4 py-3">Market</th>
                <th className="px-4 py-3">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row, index) => (
                <tr key={`${row.type}-${row.name}-${row.companyName}-${index}`}>
                  <td className="px-4 py-4 align-top"><span className="badge bg-slate-50">{row.type || "—"}</span></td>
                  <td className="px-4 py-4 align-top font-black text-slate-950">{row.name || "—"}</td>
                  <td className="px-4 py-4 align-top text-slate-700">{row.role || "—"}</td>
                  <td className="px-4 py-4 align-top text-slate-700">{row.companyName || "—"}</td>
                  <td className="px-4 py-4 align-top space-x-3">
                    {row.website ? <a href={row.website} target="_blank" rel="noreferrer" className="font-bold underline">Website</a> : null}
                    {row.linkedinUrl ? <a href={row.linkedinUrl} target="_blank" rel="noreferrer" className="font-bold underline">LinkedIn</a> : null}
                    {row.sourceUrl ? <a href={row.sourceUrl} target="_blank" rel="noreferrer" className="font-bold underline">Source</a> : null}
                    {!row.website && !row.linkedinUrl && !row.sourceUrl ? "—" : null}
                  </td>
                  <td className="px-4 py-4 align-top text-slate-700">
                    <p>{row.publicEmail || "—"}</p>
                    <p className="text-xs text-slate-500">{row.phone || ""}</p>
                  </td>
                  <td className="px-4 py-4 align-top text-slate-700">{row.cityState || "—"}</td>
                  <td className="px-4 py-4 align-top">{typeof row.leadScore === "number" ? <span className="badge bg-emerald-50 text-emerald-700">{row.leadScore}</span> : "—"}</td>
                </tr>
              ))}
              {!filtered.length ? (
                <tr><td colSpan={8} className="px-4 py-16 text-center text-slate-500">No intelligence records yet. Save selected Lead Machine or LinkedIn Prospector results into the bank.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
