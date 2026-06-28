"use client";

import { useState } from "react";

type Provider = {
  npi: string;
  name: string;
  type: string;
  city: string;
  state: string;
  postal: string;
  phone: string;
  taxonomy: string;
  enumerationDate: string;
};

const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];

function daysAgo(dateStr: string): number | null {
  if (!dateStr) return null;
  const t = Date.parse(dateStr);
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86_400_000);
}

function csvEscape(v: string) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function NpiRadar() {
  const [state, setState] = useState("");
  const [taxonomy, setTaxonomy] = useState("Behavior Analyst");
  const [type, setType] = useState<"NPI-2" | "NPI-1">("NPI-2");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function search() {
    if (!state || loading) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ state, taxonomy, type });
      const res = await fetch(`/api/npi-search?${params.toString()}`);
      const data = await res.json();
      if (data.error) setError(data.error);
      setProviders(Array.isArray(data.providers) ? data.providers : []);
      setSearched(true);
    } catch {
      setError("Search failed — please try again.");
    } finally {
      setLoading(false);
    }
  }

  function exportCsv() {
    const headers = ["Registered", "Name", "Type", "City", "State", "ZIP", "Phone", "Taxonomy", "NPI"];
    const rows = providers.map((p) =>
      [p.enumerationDate, p.name, p.type, p.city, p.state, p.postal, p.phone, p.taxonomy, p.npi].map(csvEscape).join(",")
    );
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `new-aba-clinics-${state}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const field = "rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none";

  return (
    <div className="space-y-6">
      {/* Honest explainer */}
      <div className="rounded-2xl border border-cyan-200 bg-cyan-50/60 px-5 py-4 text-sm leading-6 text-slate-700">
        <span className="font-black text-cyan-800">How to use this.</span> This pulls the public federal NPI registry for ABA providers in a state, newest registration first. A clinic that just enumerated is about to need scheduling/billing software and likely hasn&rsquo;t been pitched yet — reach out while you&rsquo;re first. Caveats: the date is when they got their NPI (close to opening, not exact); &ldquo;Organization&rdquo; = a clinic entity, &ldquo;Individual&rdquo; = a solo BCBA; and it shows up to 200 per search, so check your target states regularly rather than expecting one giant list.
      </div>

      {/* Search form */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs font-bold text-slate-500">
            State
            <select className={field} value={state} onChange={(e) => setState(e.target.value)}>
              <option value="">Choose…</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold text-slate-500">
            Provider type
            <select className={field} value={type} onChange={(e) => setType(e.target.value as "NPI-2" | "NPI-1")}>
              <option value="NPI-2">Organizations (clinics)</option>
              <option value="NPI-1">Individuals (BCBAs)</option>
            </select>
          </label>
          <label className="flex flex-1 flex-col gap-1 text-xs font-bold text-slate-500">
            Taxonomy
            <input className={`${field} w-full`} value={taxonomy} onChange={(e) => setTaxonomy(e.target.value)} placeholder="Behavior Analyst" />
          </label>
          <button onClick={search} disabled={!state || loading} className="rounded-full bg-slate-950 px-6 py-2.5 text-sm font-black text-white disabled:opacity-40">
            {loading ? "Searching…" : "Find clinics"}
          </button>
        </div>
        <p className="mt-2 text-[11px] font-semibold text-slate-400">Try taxonomy &ldquo;Behavior Analyst&rdquo; or &ldquo;Behavior Technician&rdquo;. No data is stored — this is a live lookup.</p>
      </section>

      {error && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">{error}</div>}

      {/* Results */}
      {searched && !error && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-black text-slate-700">{providers.length} provider{providers.length === 1 ? "" : "s"} — newest first</p>
            {providers.length > 0 && (
              <button onClick={exportCsv} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-800">Export CSV</button>
            )}
          </div>
          {providers.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No matches. Try a different state or taxonomy (e.g. &ldquo;Behavior Technician&rdquo;).</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-2 pr-3">Registered</th>
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Location</th>
                    <th className="py-2 pr-3">Phone</th>
                    <th className="py-2 pr-3">NPI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {providers.map((p) => {
                    const d = daysAgo(p.enumerationDate);
                    const fresh = d !== null && d <= 120;
                    return (
                      <tr key={p.npi}>
                        <td className="py-2.5 pr-3 align-top">
                          <span className="text-slate-700">{p.enumerationDate || "—"}</span>
                          {d !== null && (
                            <span className={`badge ml-2 ${fresh ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{d}d ago</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-3 align-top">
                          <span className="font-bold text-slate-900">{p.name}</span>
                          <span className="ml-2 text-[10px] uppercase tracking-wide text-slate-400">{p.type}</span>
                        </td>
                        <td className="py-2.5 pr-3 align-top text-slate-600">{[p.city, p.state].filter(Boolean).join(", ")} {p.postal}</td>
                        <td className="py-2.5 pr-3 align-top text-slate-600">{p.phone || "—"}</td>
                        <td className="py-2.5 pr-3 align-top text-slate-400">{p.npi}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
