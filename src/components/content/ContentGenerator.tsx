"use client";

import { useState } from "react";

const topics = [
  "ABA EMR vs operational recovery layer",
  "CentralReach alternative? Consider recovery before migration",
  "How ABA clinics lose revenue from cancellations",
  "ABA scheduling software is not enough without a recovery workflow",
  "How to recover ABA makeup sessions",
  "ABA staff callout coverage workflow",
  "Software stack for opening a new ABA clinic",
  "ABA caregiver communication workflow",
  "ABA documentation readiness checklist",
  "How to protect authorized hours before they disappear"
];

export function ContentGenerator() {
  const [topic, setTopic] = useState(topics[0]);
  const [format, setFormat] = useState("SEO article brief");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, format })
      });
      const payload = await response.json();
      setDraft(payload.content ?? "No content returned.");
    } catch (error) {
      setDraft(error instanceof Error ? error.message : "Content generation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="card">
        <h2 className="text-2xl font-black text-slate-950">Generate approved-first drafts</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Drafts should be reviewed before publication. The generator preserves no-migration positioning and avoids PHI prompts.
        </p>
        <div className="mt-6 space-y-4">
          <label className="space-y-2 block">
            <span className="label">Topic</span>
            <select className="input" value={topic} onChange={(event) => setTopic(event.target.value)}>
              {topics.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="space-y-2 block">
            <span className="label">Format</span>
            <select className="input" value={format} onChange={(event) => setFormat(event.target.value)}>
              <option>SEO article brief</option>
              <option>LinkedIn post</option>
              <option>Google Ads copy</option>
              <option>Email nurture draft</option>
            </select>
          </label>
          <button type="button" onClick={generate} disabled={loading} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-50">
            {loading ? "Generating..." : "Generate draft"}
          </button>
        </div>
      </section>
      <section className="card">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-slate-950">Draft</h2>
          <span className="badge">Review before publish</span>
        </div>
        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Generated content appears here..." className="mt-6 h-[560px] w-full resize-none rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-800" />
      </section>
    </div>
  );
}
