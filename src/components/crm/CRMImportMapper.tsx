"use client";

import { useMemo, useState } from "react";
import { scoreReasonsForDisplay } from "@/lib/score-reasons-ui";
import { ScoreReasonsPanel } from "@/components/leads/ScoreReasonsPanel";

type CsvRow = Record<string, string>;

type FieldKey = "companyName" | "contactName" | "role" | "email" | "website" | "phone" | "cityState" | "currentEmr" | "sourceUrl" | "socialUrl" | "status" | "notes";

const targetFields: Array<{ key: FieldKey; label: string }> = [
  { key: "companyName", label: "Company / clinic name" },
  { key: "contactName", label: "Contact name" },
  { key: "role", label: "Role" },
  { key: "email", label: "Public email" },
  { key: "website", label: "Website" },
  { key: "phone", label: "Phone" },
  { key: "cityState", label: "City / state" },
  { key: "currentEmr", label: "Current EMR" },
  { key: "sourceUrl", label: "Source URL" },
  { key: "socialUrl", label: "LinkedIn/Facebook/Reddit URL" },
  { key: "status", label: "Status / suppression" },
  { key: "notes", label: "Notes" }
];

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return { headers: [], rows: [] as CsvRow[] };
  const parseLine = (line: string) => {
    const cells: string[] = [];
    let current = "";
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];
      if (char === '"' && quoted && next === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === "," && !quoted) {
        cells.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    cells.push(current.trim());
    return cells;
  };
  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const cells = parseLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
  });
  return { headers, rows };
}

function guessMapping(headers: string[]) {
  const mapping: Partial<Record<FieldKey, string>> = {};
  for (const header of headers) {
    const key = header.toLowerCase();
    if (/company|clinic|business/.test(key)) mapping.companyName = header;
    else if (/contact|name|person/.test(key)) mapping.contactName = header;
    else if (/role|title/.test(key)) mapping.role = header;
    else if (/email/.test(key)) mapping.email = header;
    else if (/website|domain/.test(key)) mapping.website = header;
    else if (/phone|mobile/.test(key)) mapping.phone = header;
    else if (/city|state|market|location/.test(key)) mapping.cityState = header;
    else if (/emr|ehr|software/.test(key)) mapping.currentEmr = header;
    else if (/source/.test(key)) mapping.sourceUrl = header;
    else if (/linkedin|facebook|reddit|social/.test(key)) mapping.socialUrl = header;
    else if (/status|suppression|do not/.test(key)) mapping.status = header;
    else if (/note|pain/.test(key)) mapping.notes = header;
  }
  return mapping;
}

function normalize(value: unknown) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function isDoNotContact(row: CsvRow, mapping: Partial<Record<FieldKey, string>>) {
  const text = [mapping.status, mapping.notes, mapping.email].map((field) => field ? row[field] : "").join(" ").toLowerCase();
  return /do not contact|unsubscribe|remove me|suppressed|opt out|opt-out/.test(text);
}

export function CRMImportMapper() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [mapping, setMapping] = useState<Partial<Record<FieldKey, string>>>({});
  const [notice, setNotice] = useState("Upload a CSV to preview mapping, duplicates, do-not-contact rows and lead score reasons before saving to the Intelligence Bank.");
  const [saving, setSaving] = useState(false);

  const mappedRows = useMemo(() => rows.map((row) => {
    const get = (key: FieldKey) => mapping[key] ? row[mapping[key] as string] ?? "" : "";
    const companyName = get("companyName");
    const contactName = get("contactName");
    const role = get("role");
    const website = get("website");
    const email = get("email");
    const sourceUrl = get("sourceUrl") || get("socialUrl");
    const notes = get("notes");
    const currentEmr = get("currentEmr");
    const score = scoreReasonsForDisplay({ companyName, contactRole: role, sourceSignal: currentEmr, title: contactName, snippet: [notes, sourceUrl].join(" "), status: isDoNotContact(row, mapping) ? "DO_NOT_CONTACT" : undefined });
    return { row, companyName, contactName, role, website, email, phone: get("phone"), cityState: get("cityState"), currentEmr, sourceUrl, notes, suppressed: isDoNotContact(row, mapping), score };
  }), [mapping, rows]);

  const duplicateKeys = useMemo(() => {
    const seen = new Map<string, number>();
    for (const row of mappedRows) {
      const key = normalize(row.website || row.email || `${row.companyName}-${row.cityState}`);
      seen.set(key, (seen.get(key) ?? 0) + 1);
    }
    return seen;
  }, [mappedRows]);

  async function handleFile(file: File) {
    const text = await file.text();
    const parsed = parseCsv(text);
    setHeaders(parsed.headers);
    setRows(parsed.rows);
    setMapping(guessMapping(parsed.headers));
    setNotice(`Loaded ${parsed.rows.length} rows. Review field mapping and duplicate preview before import.`);
  }

  async function saveImport() {
    setSaving(true);
    try {
      const records = mappedRows.filter((row) => row.companyName && !row.suppressed).map((row) => ({
        recordType: row.contactName ? "PERSON" : "COMPANY",
        name: row.contactName || row.companyName,
        companyName: row.companyName,
        role: row.role,
        website: row.website,
        linkedinUrl: row.sourceUrl.includes("linkedin") ? row.sourceUrl : undefined,
        sourceUrl: row.sourceUrl,
        publicEmail: row.email,
        phone: row.phone,
        cityState: row.cityState,
        leadScore: row.score.score,
        sourceQuery: "CRM CSV import",
        sourceTool: "CRM Import Mapper",
        notes: [row.notes, row.currentEmr ? `Current EMR: ${row.currentEmr}` : ""].filter(Boolean).join("\n")
      }));
      const response = await fetch("/api/intelligence-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records })
      });
      const data = await response.json();
      setNotice(response.ok ? `${data.saved ?? records.length} records imported to Intelligence Bank. Suppressed rows were skipped.` : data.error ?? "Import failed.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Import failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <h2 className="text-2xl font-black text-slate-950">CSV import field mapping</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Map a CSV into the Intelligence Bank with duplicate preview, suppression detection, current EMR, social/source URLs and lead score preview.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
          <input type="file" accept=".csv,text/csv" className="input" onChange={(event) => event.target.files?.[0] ? handleFile(event.target.files[0]) : undefined} />
          <button type="button" onClick={saveImport} disabled={!mappedRows.length || saving} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-60">{saving ? "Importing..." : "Import to Bank"}</button>
        </div>
        <div className="mt-4 rounded-3xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">{notice}</div>
      </section>

      {headers.length ? (
        <section className="card">
          <h3 className="text-xl font-black text-slate-950">Field mapping</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {targetFields.map((field) => (
              <label key={field.key} className="space-y-2">
                <span className="label">{field.label}</span>
                <select className="input" value={mapping[field.key] ?? ""} onChange={(event) => setMapping((prev) => ({ ...prev, [field.key]: event.target.value || undefined }))}>
                  <option value="">Not mapped</option>
                  {headers.map((header) => <option key={header} value={header}>{header}</option>)}
                </select>
              </label>
            ))}
          </div>
        </section>
      ) : null}

      <section className="card min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-black text-slate-950">Import preview</h3>
          <span className="badge">{mappedRows.length} rows</span>
        </div>
        <div className="mt-5 overflow-x-auto rounded-3xl border border-slate-200">
          <table className="min-w-[1100px] w-full divide-y divide-slate-200 bg-white text-sm">
            <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Status</th><th className="px-4 py-3">Company</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Current EMR</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Score preview</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {mappedRows.map((row, index) => {
                const key = normalize(row.website || row.email || `${row.companyName}-${row.cityState}`);
                const duplicate = (duplicateKeys.get(key) ?? 0) > 1;
                return (
                  <tr key={`${key}-${index}`}>
                    <td className="px-4 py-4 align-top"><span className={`badge ${row.suppressed ? "bg-red-50 text-red-700" : duplicate ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{row.suppressed ? "do not contact" : duplicate ? "duplicate preview" : "ready"}</span></td>
                    <td className="px-4 py-4 align-top font-black text-slate-950">{row.companyName || "—"}</td>
                    <td className="px-4 py-4 align-top text-slate-700">{row.contactName || "—"}<p className="text-xs text-slate-500">{row.role}</p></td>
                    <td className="px-4 py-4 align-top text-slate-700">{row.currentEmr || "—"}</td>
                    <td className="px-4 py-4 align-top">{row.sourceUrl ? <a href={row.sourceUrl} target="_blank" rel="noreferrer" className="font-bold underline">Source</a> : "—"}</td>
                    <td className="px-4 py-4 align-top min-w-[280px]"><ScoreReasonsPanel result={row.score} /></td>
                  </tr>
                );
              })}
              {!mappedRows.length ? <tr><td colSpan={6} className="px-4 py-16 text-center text-slate-500">Upload a CSV to preview import mapping.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
