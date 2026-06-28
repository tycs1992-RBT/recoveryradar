"use client";

// New Clinic Watch — manual tracker for newly opened / soon-to-open ABA clinics
// and companies, with their public Facebook / Instagram / website links. You curate
// the links yourself (clean + ToS-safe — no scraping). Persisted to your database
// via /api/clinic-watch, so the list syncs across devices and survives. Export to
// CSV anytime. If DATABASE_URL isn't set, it degrades to on-screen-only with a banner.

import { useCallback, useEffect, useMemo, useState } from "react";

type ClinicStatus = "Opening soon" | "Newly opened";

type ClinicEntry = {
  id: string;
  name: string;
  status: ClinicStatus;
  location: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  notes: string | null;
  createdAt: string;
};

const BLANK = { name: "", status: "Opening soon" as ClinicStatus, location: "", website: "", facebook: "", instagram: "", notes: "" };

function withHttp(url: string | null) {
  const u = (url ?? "").trim();
  if (!u) return "";
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

function csvEscape(v: string) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function NewClinicWatch() {
  const [entries, setEntries] = useState<ClinicEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [warning, setWarning] = useState("");
  const [form, setForm] = useState({ ...BLANK });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ClinicStatus>("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clinic-watch");
      const data = await res.json();
      setEntries(Array.isArray(data.clinics) ? data.clinics : []);
      setWarning(
        data.source && data.source !== "database"
          ? "Not connected to the database yet — changes won't be saved. Set DATABASE_URL and run the migration to persist."
          : ""
      );
    } catch {
      setWarning("Couldn't reach the server. Check your connection and refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return entries
      .filter((e) => statusFilter === "all" || e.status === statusFilter)
      .filter((e) => !q || [e.name, e.location ?? "", e.notes ?? ""].some((f) => f.toLowerCase().includes(q)));
  }, [entries, filter, statusFilter]);

  function resetForm() {
    setForm({ ...BLANK });
    setEditingId(null);
  }

  async function submit() {
    if (!form.name.trim() || saving) return;
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/clinic-watch/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, name: form.name.trim() })
        });
        const data = await res.json();
        if (data.clinic) {
          const updated = data.clinic as ClinicEntry;
          setEntries((prev) => prev.map((e) => (e.id === editingId ? { ...e, ...updated } : e)));
        }
      } else {
        const res = await fetch("/api/clinic-watch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, name: form.name.trim() })
        });
        const data = await res.json();
        const created = (data.clinic ?? {}) as Partial<ClinicEntry>;
        const entry: ClinicEntry = {
          id: created.id ?? (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
          name: created.name ?? form.name.trim(),
          status: (created.status as ClinicStatus) ?? form.status,
          location: created.location ?? form.location,
          website: created.website ?? form.website,
          facebook: created.facebook ?? form.facebook,
          instagram: created.instagram ?? form.instagram,
          notes: created.notes ?? form.notes,
          createdAt: created.createdAt ?? new Date().toISOString()
        };
        setEntries((prev) => [entry, ...prev]);
        if (data.persisted === false) setWarning("Saved on screen only — connect the database to persist across devices.");
      }
      resetForm();
    } catch {
      setWarning("Save failed — please try again.");
    } finally {
      setSaving(false);
    }
  }

  function edit(entry: ClinicEntry) {
    setEditingId(entry.id);
    setForm({
      name: entry.name,
      status: entry.status,
      location: entry.location ?? "",
      website: entry.website ?? "",
      facebook: entry.facebook ?? "",
      instagram: entry.instagram ?? "",
      notes: entry.notes ?? ""
    });
  }

  async function remove(id: string) {
    const prev = entries;
    setEntries((p) => p.filter((e) => e.id !== id)); // optimistic
    if (editingId === id) resetForm();
    try {
      await fetch(`/api/clinic-watch/${id}`, { method: "DELETE" });
    } catch {
      setEntries(prev); // roll back on failure
      setWarning("Delete failed — restored the entry.");
    }
  }

  function exportCsv() {
    const headers = ["Name", "Status", "Location", "Website", "Facebook", "Instagram", "Notes", "Added"];
    const rows = entries.map((e) =>
      [e.name, e.status, e.location ?? "", e.website ?? "", e.facebook ?? "", e.instagram ?? "", e.notes ?? "", e.createdAt].map(csvEscape).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "new-aba-clinics.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const field = "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none";

  return (
    <div className="space-y-6">
      {warning && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">{warning}</div>
      )}

      {/* Add / edit form */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-black uppercase tracking-wide text-slate-500">
            {editingId ? "Edit clinic" : "Add a new / opening ABA clinic"}
          </p>
          {editingId && (
            <button onClick={resetForm} className="text-xs font-bold text-slate-500 underline">
              Cancel edit
            </button>
          )}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input className={field} placeholder="Clinic / company name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className={field} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ClinicStatus })}>
            <option>Opening soon</option>
            <option>Newly opened</option>
          </select>
          <input className={field} placeholder="City, State" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <input className={field} placeholder="Website (optional)" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <input className={field} placeholder="Facebook URL" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} />
          <input className={field} placeholder="Instagram URL" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
          <textarea className={`${field} md:col-span-2`} rows={2} placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button onClick={submit} disabled={!form.name.trim() || saving} className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-black text-white disabled:opacity-40">
            {saving ? "Saving…" : editingId ? "Save changes" : "Add clinic"}
          </button>
          <p className="text-xs font-semibold text-slate-400">Saved to your workspace database. Use Export to back up or share.</p>
        </div>
      </section>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="min-w-[200px] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
          placeholder="Filter by name, city, or notes…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | ClinicStatus)}>
          <option value="all">All statuses</option>
          <option value="Opening soon">Opening soon</option>
          <option value="Newly opened">Newly opened</option>
        </select>
        <button onClick={exportCsv} disabled={!entries.length} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-800 disabled:opacity-40">
          Export CSV
        </button>
        <span className="text-sm font-bold text-slate-500">{entries.length} tracked</span>
      </div>

      {/* List */}
      {loading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-16 text-center text-slate-500">Loading…</div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-16 text-center text-slate-500">
          {entries.length === 0
            ? "No clinics yet. Add a newly opened or soon-to-open ABA clinic above."
            : "No matches for that filter."}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((e) => (
            <div key={e.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-slate-950">{e.name}</p>
                  {e.location && <p className="text-xs font-semibold text-slate-500">{e.location}</p>}
                </div>
                <span className={`badge ${e.status === "Newly opened" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{e.status}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm font-bold">
                {e.website && (
                  <a href={withHttp(e.website)} target="_blank" rel="noreferrer" className="text-slate-700 underline">Website</a>
                )}
                {e.facebook && (
                  <a href={withHttp(e.facebook)} target="_blank" rel="noreferrer" className="text-blue-700 underline">Facebook</a>
                )}
                {e.instagram && (
                  <a href={withHttp(e.instagram)} target="_blank" rel="noreferrer" className="text-pink-700 underline">Instagram</a>
                )}
                {!e.website && !e.facebook && !e.instagram && <span className="text-xs font-semibold text-slate-400">No links added</span>}
              </div>
              {e.notes && <p className="mt-2 text-sm leading-6 text-slate-600">{e.notes}</p>}
              <div className="mt-3 flex items-center gap-3 text-xs">
                <button onClick={() => edit(e)} className="font-bold text-slate-600 underline">Edit</button>
                <button onClick={() => remove(e.id)} className="font-bold text-rose-600 underline">Delete</button>
                <span className="ml-auto font-semibold text-slate-400">Added {new Date(e.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
