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
  const [selectedVariation, setSelectedVariation] = useState(1);
  const [variationsPerDay, setVariationsPerDay] = useState(20);
  const [notice, setNotice] = useState("Image prompt studio ready. Generate up to 20 variations per day for a 30-day campaign calendar.");

  const localPrompts = useMemo(
    () => buildCampaignImagePrompts({ market, audience, focusLabel, focusTheme, landingPage, keywords, variationsPerDay }),
    [audience, focusLabel, focusTheme, keywords, landingPage, market, variationsPerDay]
  );
  const activePrompts = prompts.length ? prompts : localPrompts;
  const selected = activePrompts.find((prompt) => prompt.day === selectedDay && prompt.variation === selectedVariation) ?? activePrompts[0];
  const currentDayPrompts = activePrompts.filter((prompt) => prompt.day === selectedDay);

  useEffect(() => {
    setPrompts([]);
    setSelectedDay(1);
    setSelectedVariation(1);
  }, [market, audience, focusLabel, focusTheme, landingPage, keywords, variationsPerDay]);

  async function generatePrompts() {
    try {
      const response = await fetch("/api/campaign-image-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ market, audience, focusLabel, focusTheme, landingPage, keywords, variationsPerDay })
      });
      const data = await response.json();
      setPrompts(data.prompts ?? localPrompts);
      setNotice(data.notice ?? `Generated ${localPrompts.length} campaign image prompts.`);
    } catch {
      setPrompts(localPrompts);
      setNotice(`Generated ${localPrompts.length} local campaign image prompts.`);
    }
  }

  async function copyPrompt(prompt: CampaignImagePrompt) {
    await navigator.clipboard.writeText(prompt.imagePrompt);
    setNotice(`Copied Day ${prompt.day}, Variation ${prompt.variation} image prompt.`);
  }

  async function copyCaption(prompt: CampaignImagePrompt) {
    await navigator.clipboard.writeText(prompt.caption);
    setNotice(`Copied Day ${prompt.day}, Variation ${prompt.variation} caption.`);
  }

  async function copyBundle() {
    await navigator.clipboard.writeText(activePrompts.map((prompt) => [
      `Day ${prompt.day} / Variation ${prompt.variation}: ${prompt.theme}`,
      `Format: ${prompt.format}`,
      `Strategic angle: ${prompt.strategicAngle}`,
      `Visual archetype: ${prompt.visualArchetype}`,
      `Hook: ${prompt.hook}`,
      `Prompt: ${prompt.imagePrompt}`,
      `Negative prompt: ${prompt.negativePrompt}`,
      `Caption: ${prompt.caption}`
    ].join("\n")).join("\n\n---\n\n"));
    setNotice(`Copied all ${activePrompts.length} image prompts and captions.`);
  }

  function exportCsv() {
    const rows = activePrompts.map((prompt) => [
      prompt.day,
      prompt.variation,
      prompt.format,
      prompt.theme,
      prompt.strategicAngle,
      prompt.visualArchetype,
      prompt.hook,
      prompt.imagePrompt,
      prompt.negativePrompt,
      prompt.caption,
      prompt.cta,
      prompt.landingPage
    ]);
    const csv = [["Day", "Variation", "Format", "Theme", "Strategic Angle", "Visual Archetype", "Hook", "Image Prompt", "Negative Prompt", "Caption", "CTA", "Landing Page"], ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    download("infinite-suite-30-day-600-image-prompts.csv", csv, "text/csv;charset=utf-8");
    setNotice(`Exported ${activePrompts.length} image prompts to CSV.`);
  }

  return (
    <section className="card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">Ad image prompt generator</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">30-day × 20-variation campaign prompt bank</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Generate broad, strategically different image prompts, captions, negative prompts and CTAs. Each day can produce up to 20 distinct creative directions for year-round posting and image API queues.</p>
        </div>
        <span className="badge bg-cyan-50 text-cyan-800">{activePrompts.length} assets</span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
        <label className="block space-y-2">
          <span className="label">Variations per day</span>
          <select className="input" value={variationsPerDay} onChange={(event) => setVariationsPerDay(Number(event.target.value))}>
            {[1, 3, 5, 10, 15, 20].map((count) => <option key={count} value={count}>{count} per day · {count * 30} total prompts</option>)}
          </select>
        </label>
        <div className="flex items-end"><span className="badge bg-slate-50">30 days × {variationsPerDay} = {variationsPerDay * 30}</span></div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <button type="button" onClick={generatePrompts} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">Generate prompts</button>
        <button type="button" onClick={copyBundle} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700">Copy all</button>
        <button type="button" onClick={exportCsv} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700">Export CSV</button>
        <button type="button" onClick={() => selected ? copyPrompt(selected) : undefined} className="rounded-full border border-cyan-200 bg-cyan-50 px-5 py-3 text-sm font-black text-cyan-950">Copy selected</button>
      </div>
      <div className="mt-5 rounded-3xl bg-blue-50 p-4 text-sm font-semibold leading-6 text-blue-950">{notice}</div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.42fr_0.58fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Daily asset queue</p>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {Array.from({ length: 30 }, (_, index) => index + 1).map((day) => (
              <button key={day} type="button" onClick={() => { setSelectedDay(day); setSelectedVariation(1); }} className={`rounded-2xl border p-2 text-xs font-black transition ${selectedDay === day ? "border-cyan-300 bg-cyan-50 text-cyan-900" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>Day {day}</button>
            ))}
          </div>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Day {selectedDay} variations</p>
          <div className="mt-4 max-h-[440px] space-y-2 overflow-y-auto pr-2">
            {currentDayPrompts.map((prompt) => (
              <button key={`${prompt.day}-${prompt.variation}`} type="button" onClick={() => setSelectedVariation(prompt.variation)} className={`w-full rounded-2xl border p-3 text-left transition ${selectedVariation === prompt.variation ? "border-cyan-300 bg-cyan-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Variation {prompt.variation} · {prompt.format}</p>
                <p className="mt-1 font-black text-slate-950">{prompt.strategicAngle}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{prompt.visualArchetype}</p>
              </button>
            ))}
          </div>
        </div>

        {selected ? (
          <div className="space-y-4">
            <article className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Day {selected.day} · Variation {selected.variation} · {selected.format}</p>
                  <h3 className="mt-2 text-2xl font-black text-slate-950">{selected.theme}</h3>
                  <p className="mt-2 text-sm font-bold text-cyan-800">{selected.strategicAngle}</p>
                  <p className="mt-1 text-sm text-slate-500">{selected.visualArchetype}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => copyPrompt(selected)} className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white">Copy prompt</button>
                  <button type="button" onClick={() => copyCaption(selected)} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black text-slate-700">Copy caption</button>
                </div>
              </div>
              <p className="mt-4 text-sm font-black text-slate-950">Image prompt</p>
              <textarea readOnly value={selected.imagePrompt} className="mt-2 h-52 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700" />
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
