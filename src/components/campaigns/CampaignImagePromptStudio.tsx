"use client";

import { useEffect, useMemo, useState } from "react";
import { buildCampaignImagePrompts, type CampaignImagePrompt } from "@/lib/campaign-image-prompts";

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function download(filename: string, content: string, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function CampaignImagePromptStudio({
  market,
  audience,
  focusLabel,
  focusTheme,
  landingPage,
  keywords
}: {
  market: string;
  audience: string;
  focusLabel: string;
  focusTheme: string;
  landingPage: string;
  keywords: string[];
}) {
  const [prompts, setPrompts] = useState<CampaignImagePrompt[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [notice, setNotice] = useState("Image prompt studio ready. Generate 30 daily campaign prompts for image bots/API tools.");

  const localPrompts = useMemo(() => buildCampaignImagePrompts({ market, audience, focusLabel, focusTheme, landingPage, keywords }), [audience, focusLabel, focusTheme, keywords, landingPage, market]);
  const activePrompts = prompts.length ? prompts : localPrompts;
  const selected = activePrompts.find((prompt) => prompt.day === selectedDay) ?? activePrompts[0];

  useEffect(() => {
    setPrompts([]);
    setSelectedDay(1);
  }, [market, audience, focusLabel, focusTheme, landingPage, keywords]);

  async function generatePrompts() {
    try {
      const response = await fetch("/api/campaign-image-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ market, audience, focusLabel, focusTheme, landingPage, keywords })
      });
      const data = await response.json();
      setPrompts(data.prompts ?? localPrompts);
      setNotice(data.notice ?? "Generated 30 campaign image prompts.");
    } catch {
      setPrompts(localPrompts);
      setNotice("Generated 30 local campaign image prompts.");
    }
  }

  async function copyPrompt(prompt: CampaignImagePrompt) {
    await navigator.clipboard.writeText(prompt.imagePrompt);
    setNotice(`Copied Day ${prompt.day} image prompt.`);
  }

  async function copyCaption(prompt: CampaignImagePrompt) {
    await navigator.clipboard.writeText(prompt.caption);
    setNotice(`Copied Day ${prompt.day} caption.`);
  }

  async function copyBundle() {
    await navigator.clipboard.writeText(activePrompts.map((prompt) => [
      `Day ${prompt.day}: ${prompt.theme}`,
      `Platform: ${prompt.platform}`,
      `Hook: ${prompt.hook}`,
      `Prompt: ${prompt.imagePrompt}`,
      `Negative prompt: ${prompt.negativePrompt}`,
      `Caption: ${prompt.caption}`
    ].join("\n")).join("\n\n---\n\n"));
    setNotice("Copied all 30 image prompts and captions.");
  }

  function exportCsv() {
    const rows = activePrompts.map((prompt) => [prompt.day, prompt.platform, prompt.theme, prompt.hook, prompt.imagePrompt, prompt.negativePrompt, prompt.caption, prompt.cta, prompt.landingPage]);
    const csv = [["Day", "Platform", "Theme", "Hook", "Image Prompt", "Negative Prompt", "Caption", "CTA", "Landing Page"], ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    download("infinite-suite-30-day-image-prompts.csv", csv, "text/csv;charset=utf-8");
    setNotice("Exported 30-day image prompt CSV.");
  }

  return (
    <section className="card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">Ad image prompt generator</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">30-day campaign image prompt bank</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Generate matching image prompts, captions, negative prompts and CTAs for every daily campaign angle so your image bots/API tools can work from a clean queue.</p>
        </div>
        <span className="badge bg-cyan-50 text-cyan-800">{activePrompts.length} assets</span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <button type="button" onClick={generatePrompts} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">Generate prompts</button>
        <button type="button" onClick={copyBundle} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700">Copy all</button>
        <button type="button" onClick={exportCsv} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700">Export CSV</button>
        <button type="button" onClick={() => selected ? copyPrompt(selected) : undefined} className="rounded-full border border-cyan-200 bg-cyan-50 px-5 py-3 text-sm font-black text-cyan-950">Copy selected</button>
      </div>
      <div className="mt-5 rounded-3xl bg-blue-50 p-4 text-sm font-semibold leading-6 text-blue-950">{notice}</div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.45fr_0.55fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Daily asset queue</p>
          <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto pr-2">
            {activePrompts.map((prompt) => (
              <button key={prompt.day} type="button" onClick={() => setSelectedDay(prompt.day)} className={`w-full rounded-2xl border p-3 text-left transition ${selectedDay === prompt.day ? "border-cyan-300 bg-cyan-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Day {prompt.day} · {prompt.platform}</p>
                <p className="mt-1 font-black text-slate-950">{prompt.theme}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{prompt.hook}</p>
              </button>
            ))}
          </div>
        </div>

        {selected ? (
          <div className="space-y-4">
            <article className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Day {selected.day} · {selected.platform}</p>
                  <h3 className="mt-2 text-2xl font-black text-slate-950">{selected.theme}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => copyPrompt(selected)} className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white">Copy prompt</button>
                  <button type="button" onClick={() => copyCaption(selected)} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black text-slate-700">Copy caption</button>
                </div>
              </div>
              <p className="mt-4 text-sm font-black text-slate-950">Image prompt</p>
              <textarea readOnly value={selected.imagePrompt} className="mt-2 h-44 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700" />
              <p className="mt-4 text-sm font-black text-slate-950">Negative prompt</p>
              <p className="mt-2 rounded-2xl bg-rose-50 p-4 text-sm leading-6 text-rose-900">{selected.negativePrompt}</p>
              <p className="mt-4 text-sm font-black text-slate-950">Caption</p>
              <textarea readOnly value={selected.caption} className="mt-2 h-40 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700" />
            </article>
          </div>
        ) : null}
      </div>
    </section>
  );
}
