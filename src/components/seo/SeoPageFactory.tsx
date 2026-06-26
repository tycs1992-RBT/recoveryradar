"use client";

import { useEffect, useState, useCallback } from "react";
import type { SeoLandingPage } from "@/lib/seo-page-types";
import { SEO_KEYWORD_SEEDS } from "@/lib/seo-page-types";

const SITE_URL = "https://www.infinitepieces.ai";

type FormState = {
  keyword: string;
  slug: string;
  audience: string;
  searchIntent: string;
  competitorAngle: string;
  recoveryFocus: string;
  ctaFocus: string;
  location: string;
  tone: string;
};

const EMPTY_FORM: FormState = {
  keyword: "",
  slug: "",
  audience: "",
  searchIntent: "commercial / buyer-intent",
  competitorAngle: "",
  recoveryFocus: "",
  ctaFocus: "Lost Hours Calculator",
  location: "",
  tone: "direct, operator-to-operator"
};

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* clipboard may be blocked; no-op */
  }
}

// Fire a workspace analytics event. Best-effort — never blocks the action, never throws.
function trackEvent(eventName: string, metadata: Record<string, unknown> = {}) {
  try {
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName, path: "/seo-page-factory", metadata })
    });
  } catch {
    /* analytics is non-critical */
  }
}

export function SeoPageFactory() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [draft, setDraft] = useState<SeoLandingPage | null>(null);
  const [pages, setPages] = useState<SeoLandingPage[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const loadLibrary = useCallback(async () => {
    try {
      const res = await fetch("/api/seo-pages");
      if (!res.ok) return;
      const data = await res.json();
      setPages(data.pages ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const update = (key: keyof FormState, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  async function generate() {
    if (!form.keyword.trim()) {
      setNotice("Enter or pick a target keyword first.");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const res = await fetch("/api/seo-pages/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice(data.error ?? "Generation failed.");
        return;
      }
      setDraft(data.page);
      setNotice("Draft generated. Review it below, then Save to add it to the library.");
      trackEvent("seo_page_generated", { keyword: form.keyword });
    } finally {
      setBusy(false);
    }
  }

  async function saveDraft() {
    if (!draft) return;
    setBusy(true);
    try {
      const res = await fetch("/api/seo-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft)
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice(data.error ?? "Save failed.");
        return;
      }
      setDraft(data.page);
      setNotice(data.notice ?? "Saved.");
      await loadLibrary();
    } finally {
      setBusy(false);
    }
  }

  async function act(id: string, action: "approve" | "publish" | "archive") {
    setBusy(true);
    try {
      const res = await fetch(`/api/seo-pages/${id}/${action}`, { method: "POST" });
      const data = await res.json();
      setNotice(data.notice ?? `${action} done.`);
      trackEvent(`seo_page_${action}`, { id, slug: data.page?.slug });
      if (data.page) setDraft((prev) => (prev && prev.id === id ? data.page : prev));
      await loadLibrary();
    } finally {
      setBusy(false);
    }
  }

  const searchConsoleUrls = pages
    .filter((p) => p.status === "PUBLISHED")
    .map((p) => `${SITE_URL}/topics/${p.slug}`)
    .join("\n");

  return (
    <div className="space-y-6">
      {notice ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700">{notice}</div>
      ) : null}

      {/* Strategy panel — the positioning every generated page must reinforce */}
      <details className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.25em] text-slate-400">Strategy — why now &amp; our moat</summary>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">Why now</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
              {"The ABA software market is consolidating around connected clinical and operational workflows. But many clinics are not ready for another full-system migration.\n\nInfinite Suite OS™ starts with the highest-friction operational gap: cancellations and callouts becoming lost hours.\n\nKeep your EMR. Add recovery beside it. Measure the hours at risk. Recover the workflow first."}
            </p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">Our moat</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
              {"Our moat is not \u201cwe have a lot of apps.\u201d Our moat is: we are the best at one painful recovery workflow.\n\nOne canceled session becomes one recovered, supported, documented, review-ready hour."}
            </p>
          </div>
        </div>
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-900">
          Every page you publish here reinforces this: keep the current EMR, add Infinite Suite OS™ beside it as an operational recovery layer. No EMR-replacement claims, no compliance/billing guarantees, no fabricated stats.
        </p>
      </details>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Keyword source + generator form */}
        <section className="space-y-5">
          <div className="card">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">1. Keyword source</p>
            <p className="mt-2 text-sm text-slate-600">Tap a seed to load it, then refine below.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SEO_KEYWORD_SEEDS.map((seed) => (
                <button
                  key={seed}
                  type="button"
                  onClick={() => update("keyword", seed)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold ${form.keyword === seed ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"}`}
                >
                  {seed}
                </button>
              ))}
            </div>
          </div>

          <div className="card space-y-3">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">2. Page generator</p>
            <Field label="Target keyword" value={form.keyword} onChange={(v) => update("keyword", v)} placeholder="ABA EMR alternative" />
            <Field label="Slug (optional)" value={form.slug} onChange={(v) => update("slug", v)} placeholder="auto from keyword" />
            <Field label="Audience" value={form.audience} onChange={(v) => update("audience", v)} placeholder="ABA clinic owners and operations leaders" />
            <Field label="Search intent" value={form.searchIntent} onChange={(v) => update("searchIntent", v)} />
            <Field label="Competitor angle (optional)" value={form.competitorAngle} onChange={(v) => update("competitorAngle", v)} placeholder="e.g. CentralReach" />
            <Field label="Recovery module focus (optional)" value={form.recoveryFocus} onChange={(v) => update("recoveryFocus", v)} placeholder="SubPool coverage" />
            <Field label="CTA focus" value={form.ctaFocus} onChange={(v) => update("ctaFocus", v)} />
            <Field label="Location (optional)" value={form.location} onChange={(v) => update("location", v)} />
            <Field label="Tone" value={form.tone} onChange={(v) => update("tone", v)} />
            <button type="button" onClick={generate} disabled={busy} className="mt-2 w-full rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white disabled:opacity-50">
              {busy ? "Working…" : "Generate page draft"}
            </button>
          </div>
        </section>

        {/* Draft preview + actions */}
        <section className="space-y-5">
          {draft ? (
            <>
              <div className="card space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">3. Draft preview</p>
                  <StatusBadge status={draft.status} />
                </div>
                <Labeled label="SEO title">{draft.seoTitle}</Labeled>
                <Labeled label="Meta description">{draft.metaDescription}</Labeled>
                <Labeled label="H1">{draft.h1}</Labeled>
                <Labeled label="Sections">{draft.sections.map((s) => s.heading).join(" · ")}</Labeled>
                <Labeled label="FAQs">{draft.faq.length} questions</Labeled>
                <details className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <summary className="cursor-pointer text-xs font-black uppercase tracking-wide text-slate-500">Schema JSON-LD</summary>
                  <pre className="mt-2 overflow-x-auto text-[11px] text-slate-600">{JSON.stringify(draft.schemaJson, null, 2)}</pre>
                </details>
                <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-900">{draft.complianceNotes}</p>
              </div>

              <div className="card">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">4. Actions</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <ActionButton onClick={saveDraft} disabled={busy}>Save draft</ActionButton>
                  <ActionButton onClick={() => copyText(buildBrief(draft))} disabled={busy}>Copy page brief</ActionButton>
                  <ActionButton onClick={() => window.open(`/topics/${draft.slug}?preview=1`, "_blank")} disabled={busy}>Preview public page</ActionButton>
                  <ActionButton onClick={() => act(draft.id, "approve")} disabled={busy}>Approve page</ActionButton>
                  <ActionButton onClick={() => act(draft.id, "publish")} disabled={busy} primary>Publish page</ActionButton>
                  <ActionButton onClick={() => act(draft.id, "archive")} disabled={busy}>Archive page</ActionButton>
                  <ActionButton onClick={() => copyText(draft.socialPosts.linkedinFounder)} disabled={busy}>Copy LinkedIn teaser</ActionButton>
                  <ActionButton onClick={() => copyText(draft.socialPosts.facebook)} disabled={busy}>Copy Facebook teaser</ActionButton>
                  <ActionButton onClick={() => copyText(draft.emailTeaser)} disabled={busy}>Copy email teaser</ActionButton>
                  <ActionButton onClick={() => copyText(searchConsoleUrls)} disabled={busy}>Copy Search Console URLs</ActionButton>
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-500">
                  Next: Save → Approve → Publish → commit data/seo-pages.json and push → submit the URL in Google Search Console.
                </p>
              </div>

              <div className="card">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">Social + email copy</p>
                <SocialBlock label="LinkedIn (founder)" text={draft.socialPosts.linkedinFounder} />
                <SocialBlock label="LinkedIn (short)" text={draft.socialPosts.linkedinShort} />
                <SocialBlock label="Facebook" text={draft.socialPosts.facebook} />
                <SocialBlock label="Email teaser" text={draft.emailTeaser} />
                <SocialBlock label={`Google Ads`} text={`${draft.socialPosts.googleAdsHeadline}\n${draft.socialPosts.googleAdsDescription}`} />
              </div>
            </>
          ) : (
            <div className="card text-sm text-slate-500">Generate a draft to preview it here, then save and publish.</div>
          )}
        </section>
      </div>

      {/* Page library */}
      <section className="card">
        <div className="flex items-center justify-between">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">Page library</p>
          <button type="button" onClick={loadLibrary} className="text-xs font-bold text-slate-500 hover:text-slate-900">Refresh</button>
        </div>
        {pages.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No pages yet. Generate and save your first one above.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="text-xs font-black uppercase tracking-wide text-slate-400">
                  <th className="pb-2">Keyword</th>
                  <th className="pb-2">Slug</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Updated</th>
                  <th className="pb-2">URL</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pages.map((page) => (
                  <tr key={page.id} className="align-top">
                    <td className="py-3 font-semibold text-slate-800">{page.keyword}</td>
                    <td className="py-3 text-slate-500">{page.slug}</td>
                    <td className="py-3"><StatusBadge status={page.status} /></td>
                    <td className="py-3 text-slate-500">{new Date(page.updatedAt).toLocaleDateString()}</td>
                    <td className="py-3">
                      <a href={`/topics/${page.slug}${page.status === "PUBLISHED" ? "" : "?preview=1"}`} target="_blank" rel="noreferrer" className="text-slate-600 underline-offset-2 hover:underline">/topics/{page.slug}</a>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <MiniButton onClick={() => { setDraft(page); setNotice("Loaded into preview."); }}>Open</MiniButton>
                        {page.status !== "APPROVED" && page.status !== "PUBLISHED" ? <MiniButton onClick={() => act(page.id, "approve")}>Approve</MiniButton> : null}
                        {page.status !== "PUBLISHED" ? <MiniButton onClick={() => act(page.id, "publish")}>Publish</MiniButton> : null}
                        {page.status !== "ARCHIVED" ? <MiniButton onClick={() => act(page.id, "archive")}>Archive</MiniButton> : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
      />
    </label>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</span>
      <p className="mt-1 text-sm font-semibold text-slate-800">{children}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: SeoLandingPage["status"] }) {
  const tone: Record<SeoLandingPage["status"], string> = {
    DRAFT: "bg-slate-100 text-slate-600",
    NEEDS_REVIEW: "bg-amber-100 text-amber-800",
    APPROVED: "bg-blue-100 text-blue-800",
    PUBLISHED: "bg-emerald-100 text-emerald-800",
    ARCHIVED: "bg-slate-100 text-slate-400"
  };
  return <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${tone[status]}`}>{status}</span>;
}

function ActionButton({ children, onClick, disabled, primary }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-4 py-2 text-xs font-black disabled:opacity-50 ${primary ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700 hover:border-slate-400"}`}
    >
      {children}
    </button>
  );
}

function MiniButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:border-slate-400">
      {children}
    </button>
  );
}

function SocialBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
        <button type="button" onClick={() => copyText(text)} className="text-[11px] font-bold text-slate-500 hover:text-slate-900">Copy</button>
      </div>
      <p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-600">{text}</p>
    </div>
  );
}

function buildBrief(page: SeoLandingPage): string {
  return [
    `Keyword: ${page.keyword}`,
    `Slug: /topics/${page.slug}`,
    `SEO title: ${page.seoTitle}`,
    `Meta: ${page.metaDescription}`,
    `H1: ${page.h1}`,
    "",
    "Sections:",
    ...page.sections.map((s) => `- ${s.heading}: ${s.body}`),
    "",
    "FAQ:",
    ...page.faq.map((f) => `Q: ${f.question}\nA: ${f.answer}`),
    "",
    `Compliance: ${page.complianceNotes}`
  ].join("\n");
}
