"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { quizQuestions, quizSchema, segmentQuizResponse, type QuizResponse, type QuizResult } from "@/lib/quiz";

const initialResponses: QuizResponse = {
  currentSystem: "CentralReach",
  biggestPain: "cancellations",
  cancellationWorkflow: "manual calls/texts",
  calloutWorkflow: "depends on scheduler",
  billExportReadiness: "only after manual review",
  caregiverCommunication: "manually",
  emrSolvesRecovery: "partially",
  shoppingTimeline: "just researching",
  locations: "single"
};

export function QuizFlow() {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<QuizResponse>(initialResponses);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  const question = quizQuestions[step];
  const result = useMemo(() => segmentQuizResponse(responses), [responses]);

  function update(key: keyof QuizResponse, value: string) {
    setResponses((prev) => ({ ...prev, [key]: value }));
  }

  async function finish() {
    const parsed = quizSchema.safeParse(responses);
    if (!parsed.success) return;
    setSubmitted(true);
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data)
      });
      setSaved(response.ok);
    } catch {
      setSaved(false);
    }
  }

  if (submitted) return <QuizResults result={result} saved={saved} responses={responses} />;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="card">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">Question {step + 1} of {quizQuestions.length}</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{question.question}</h2>
          </div>
          <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white sm:flex">
            {step + 1}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {question.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => update(question.key as keyof QuizResponse, option)}
              className={`rounded-2xl border px-5 py-4 text-left text-sm font-bold transition ${
                responses[question.key as keyof QuizResponse] === option
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((prev) => Math.max(0, prev - 1))}
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 disabled:opacity-40"
            disabled={step === 0}
          >
            Back
          </button>
          {step < quizQuestions.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => prev + 1)}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
            >
              See recommendation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function QuizResults({ result, saved, responses }: { result: QuizResult; saved: boolean; responses: QuizResponse }) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="card bg-slate-950 text-white">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-400">Quiz result</p>
        <h2 className="mt-3 text-4xl font-black tracking-tight">{result.segmentLabel}</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">{result.cta}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={result.demoPath} className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">
            Open recommended path
          </Link>
          <Link href="/calculator" className="rounded-full border border-white/20 px-5 py-3 text-sm font-black text-white">
            Calculate lost hours
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-xl font-black text-slate-950">Likely hidden issues</h3>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            {result.hiddenIssues.map((issue) => (
              <li key={issue} className="rounded-2xl bg-slate-50 p-4">{issue}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3 className="text-xl font-black text-slate-950">Recommended Core 7 modules</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {result.recommendedModules.map((module) => (
              <span key={module} className="badge bg-slate-50">{module}</span>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            <strong className="text-slate-900">Primary pain:</strong> {result.primaryPain}. Current system: {responses.currentSystem}. Shopping timeline: {responses.shoppingTimeline}.
          </div>
          <p className="mt-4 text-xs text-slate-500">
            {saved ? "Quiz response saved if your database is connected." : "Quiz result shown locally. Connect the database to persist responses."}
          </p>
        </div>
      </div>
    </div>
  );
}
