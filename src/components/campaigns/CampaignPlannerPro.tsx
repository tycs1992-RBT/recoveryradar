"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const focusOptions = [
  {
    key: "lost-hours",
    label: "Lost Hours",
    page: "/calculator",
    theme: "Recover the hour before it disappears",
    keywords: ["ABA cancellation management software", "ABA makeup session software", "recover lost ABA hours"],
    pain: "cancellations and callouts create revenue leakage, scheduler scramble and documentation cleanup",
    promise: "help clinics calculate, route and review recovery opportunities beside the current EMR"
  },
  {
    key: "emr-overlay",
    label: "EMR Overlay",
    page: "/aba-emr-comparison",
    theme: "Keep your EMR. Add recovery beside it.",
    keywords: ["ABA EMR software", "ABA practice management software", "CentralReach alternative"],
    pain: "clinics may blame the EMR when the real problem is the recovery workflow around it",
    promise: "show owners a lower-friction path before migration"
  },
  {
    key: "founding-trial",
    label: "Founding Trial",
    page: "/active-learner-pricing",
    theme: "Active-learner pricing without staff-seat punishment",
    keywords: ["ABA software pricing", "active learner pricing", "ABA clinic software cost"],
    pain: "staff-seat pricing punishes turnover, floaters, caregivers and part-time teams",
    promise: "make Infinite easy to test with a recovered-hour scorecard"
  },
  {
    key: "staff-coverage",
    label: "Staff Coverage",
    page: "/aba-staff-coverage-software",
    theme: "RBT callouts should trigger coverage, not chaos",
    keywords: ["RBT callout coverage", "ABA staff coverage software", "ABA staff scheduling software"],
    pain: "callouts create schedule holes and manual scramble",
    promise: "turn coverage gaps into structured recovery workflows"
  },
  {
    key: "new-clinic",
    label: "New Clinics",
    page: "/software-for-new-aba-clinic",
    theme: "Build recovery into the stack from day one",
    keywords: ["software for new ABA clinic", "ABA clinic startup software", "ABA software for startups"],
    pain: "new clinics can build process debt before they scale",
    promise: "help founders start with a cleaner operations stack"
  }
] as const;

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function copyText(text: string) {
  return navigator.clipboard.writeText(text);
}

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

export function CampaignPlannerPro() {
  const [market, setMarket] = useState("Florida");
  const [audience, setAudience] = useState("ABA clinic owners, founders, clinical directors and operations managers");
  const [selectedFocus, setSelectedFocus] = useState<(typeof focusOptions)[number]["key"]>("lost-hours");
  const [notice, setNotice] = useState("Campaign brain ready. Generate, copy, export, and route work into the rest of the workspace.");

  const focus = focusOptions.find((item) => item.key === selectedFocus) ?? focusOptions[0];

  const weeks = useMemo(() => [
    {
      week: "Week 1",
      date: `${addDays(0)} - ${addDays(6)}`,
      theme: focus.theme,
      goal: "Drive attention to one clear buyer pain and send traffic to the correct CTA.",
      actions: ["Publish 3 founder-led LinkedIn posts", "Run Lead Machine for one target state", "Save reviewed companies to Intelligence Bank", "Check Analytics after each post"],
      page: focus.page
    },
    {
      week: "Week 2",
      date: `${addDays(7)} - ${addDays(13)}`,
      theme: "Executive prospecting and clinic-owner conversations",
      goal: "Find founders, CEOs, owners and clinical directors, then move reviewed prospects into follow-up.",
      actions: ["Run Executive Prospector", "Copy names for manual LinkedIn review", "Draft connection notes", "Create follow-up tasks"],
      page: "/executive-prospector"
    },
    {
      week: "Week 3",
      date: `${addDays(14)} - ${addDays(20)}`,
      theme: "Proof, pricing and recovered-hour math",
      goal: "Make the offer feel easy to test and financially reasonable.",
      actions: ["Post pricing math", "Share active-learner angle", "Push calculator CTA", "Export lead list for review"],
      page: "/active-learner-pricing"
    },
    {
      week: "Week 4",
      date: `${addDays(21)} - ${addDays(27)}`,
      theme: "Walkthroughs and founding clinic pipeline",
      goal: "Convert interest into walkthroughs and design partner conversations.",
      actions: ["Invite warm leads to Provider Portal", "Review Analytics top pages", "Follow up with replies", "Book walkthroughs"],
      page: "/provider-portal"
    }
  ], [focus]);

  const linkedinPosts = useMemo(() => [
    `Most ABA software conversations start with the EMR. But the deeper operational question is: how many hours are disappearing from ${focus.pain}? Infinite Suite OS™ is built to ${focus.promise}. Start here: https://www.infinitepieces.ai${focus.page}`,
    `A cancellation should not automatically become a lost hour. The workflow should be: schedule gap → auth check → coverage option → caregiver update → review-ready packet. That is the recovery layer Infinite Suite OS™ is building beside the current EMR.`,
    `Competitors manage the record. Infinite recovers the hour. This week I am talking with ${audience} in ${market} about ${focus.theme.toLowerCase()}.`,
    `If a clinic recovered only a few missed sessions per month, the software could start paying for itself. That is why Infinite Suite OS™ is priced around active learners, not staff seats.`
  ], [audience, focus, market]);

  const pitches = useMemo(() => [
    `I am building Infinite Suite OS™ for ABA clinics that want to keep their current EMR but recover more lost hours from cancellations, callouts and coverage gaps. Would it be worth calculating what your clinic may be losing each month?`,
    `I noticed many clinics shop for new software when the real leak may be the workflow around missed sessions. Infinite Suite OS™ adds an operational recovery layer beside the current system.`,
    `The founding clinic trial is designed to be low friction: active-learner pricing, unlimited staff/caregiver seats and a recovered-hour scorecard.`
  ], []);

  const campaignBrief = useMemo(() => {
    return [
      `Campaign focus: ${focus.theme}`,
      `Market: ${market}`,
      `Audience: ${audience}`,
      `Landing page: https://www.infinitepieces.ai${focus.page}`,
      `Keywords: ${focus.keywords.join(", ")}`,
      "",
      "Weekly plan:",
      ...weeks.flatMap((week) => [`${week.week}: ${week.theme}`, `Goal: ${week.goal}`, `Actions: ${week.actions.join("; ")}`, `Route: ${week.page}`, ""]),
      "LinkedIn posts:",
      ...linkedinPosts.map((post, index) => `${index + 1}. ${post}`),
      "",
      "Founder pitches:",
      ...pitches.map((pitch, index) => `${index + 1}. ${pitch}`)
    ].join("\n");
  }, [audience, focus, linkedinPosts, market, pitches, weeks]);

  function exportCsv() {
    const rows = weeks.map((week) => [week.week, week.date, week.theme, week.goal, week.page, week.actions.join("; ")]);
    const csv = [["Week", "Date", "Theme", "Goal", "Route", "Actions"], ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    download("recovery-radar-campaign-plan.csv", csv, "text/csv;charset=utf-8");
    setNotice("Downloaded campaign CSV.");
  }

  return (
    <div className="space-y-8">
      <section className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">Marketing AI brain</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Weekly campaign command center</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Pick a market and campaign focus. The planner builds LinkedIn posts, founder pitches, weekly action plans, CTA routing and exportable campaign assets from Infinite Suite OS™ positioning.</p>
          </div>
          <span className="badge bg-cyan-50 text-cyan-800">All buttons active</span>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <label className="block space-y-2"><span className="label">Market</span><input className="input" value={market} onChange={(event) => setMarket(event.target.value)} /></label>
          <label className="block space-y-2 lg:col-span-2"><span className="label">Audience</span><input className="input" value={audience} onChange={(event) => setAudience(event.target.value)} /></label>
          <label className="block space-y-2 lg:col-span-3"><span className="label">Campaign focus</span><select className="input" value={selectedFocus} onChange={(event) => setSelectedFocus(event.target.value as typeof selectedFocus)}>{focusOptions.map((item) => <option key={item.key} value={item.key}>{item.label} — {item.theme}</option>)}</select></label>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <button type="button" onClick={() => copyText(campaignBrief).then(() => setNotice("Copied complete campaign brief."))} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">Copy brief</button>
          <button type="button" onClick={() => copyText(linkedinPosts.join("\n\n---\n\n")).then(() => setNotice("Copied LinkedIn posts."))} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700">Copy LinkedIn</button>
          <button type="button" onClick={() => copyText(pitches.join("\n\n")).then(() => setNotice("Copied founder pitches."))} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700">Copy pitches</button>
          <button type="button" onClick={() => download("recovery-radar-campaign-brief.txt", campaignBrief)} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700">Download brief</button>
          <button type="button" onClick={exportCsv} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700">Export CSV</button>
          <Link href={focus.page} className="rounded-full border border-cyan-200 bg-cyan-50 px-5 py-3 text-center text-sm font-black text-cyan-950">Open CTA</Link>
        </div>
        <div className="mt-6 rounded-3xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">{notice}</div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link href="/lead-machine" className="card p-5 hover:bg-slate-50"><p className="font-black text-slate-950">Lead Machine</p><p className="mt-2 text-sm text-slate-600">Build the weekly lead list.</p></Link>
        <Link href="/executive-prospector" className="card p-5 hover:bg-slate-50"><p className="font-black text-slate-950">Executive Prospector</p><p className="mt-2 text-sm text-slate-600">Find owner/director names.</p></Link>
        <Link href="/intelligence-bank" className="card p-5 hover:bg-slate-50"><p className="font-black text-slate-950">Intelligence Bank</p><p className="mt-2 text-sm text-slate-600">Store deduped records.</p></Link>
        <Link href="/analytics" className="card p-5 hover:bg-slate-50"><p className="font-black text-slate-950">Analytics</p><p className="mt-2 text-sm text-slate-600">See traffic and page interest.</p></Link>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="card">
          <h2 className="text-2xl font-black text-slate-950">Weekly launch plan</h2>
          <div className="mt-5 space-y-4">
            {weeks.map((week) => (
              <article key={week.week} className="rounded-3xl border border-slate-200 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">{week.date}</p><h3 className="mt-2 text-xl font-black text-slate-950">{week.week}: {week.theme}</h3></div>
                  <Link href={week.page} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-black text-slate-700">Open route</Link>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{week.goal}</p>
                <div className="mt-4 grid gap-2 md:grid-cols-2">{week.actions.map((action) => <button key={action} type="button" onClick={() => copyText(action).then(() => setNotice(`Copied action: ${action}`))} className="rounded-2xl border border-slate-200 bg-white p-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50">{action}</button>)}</div>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="card">
            <h2 className="text-2xl font-black text-slate-950">LinkedIn post bank</h2>
            <div className="mt-5 space-y-3">{linkedinPosts.map((post, index) => <article key={post} className="rounded-2xl border border-slate-200 p-4"><p className="text-xs font-black text-slate-400">Post {index + 1}</p><p className="mt-2 text-sm leading-6 text-slate-700">{post}</p><button type="button" onClick={() => copyText(post).then(() => setNotice(`Copied LinkedIn post ${index + 1}.`))} className="mt-3 rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white">Copy post</button></article>)}</div>
          </section>
          <section className="card">
            <h2 className="text-2xl font-black text-slate-950">Founder pitch bank</h2>
            <div className="mt-5 space-y-3">{pitches.map((pitch, index) => <article key={pitch} className="rounded-2xl border border-slate-200 p-4"><p className="text-xs font-black text-slate-400">Pitch {index + 1}</p><p className="mt-2 text-sm leading-6 text-slate-700">{pitch}</p><button type="button" onClick={() => copyText(pitch).then(() => setNotice(`Copied pitch ${index + 1}.`))} className="mt-3 rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white">Copy pitch</button></article>)}</div>
          </section>
        </div>
      </section>

      <section className="card">
        <h2 className="text-2xl font-black text-slate-950">Keyword and CTA routing</h2>
        <div className="mt-5 flex flex-wrap gap-2">{focus.keywords.map((keyword) => <button key={keyword} type="button" onClick={() => copyText(keyword).then(() => setNotice(`Copied keyword: ${keyword}`))} className="badge bg-slate-50 hover:bg-cyan-50">{keyword}</button>)}</div>
        <p className="mt-4 text-sm font-semibold text-slate-600">Primary route: <Link href={focus.page} className="font-black underline">https://www.infinitepieces.ai{focus.page}</Link></p>
      </section>
    </div>
  );
}
