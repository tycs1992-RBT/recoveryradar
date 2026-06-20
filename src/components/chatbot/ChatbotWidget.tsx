"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { botOpening, getBotNode, type BotNode } from "@/lib/bot-flows";

type Message = {
  id: string;
  role: "bot" | "visitor";
  text: string;
};

export function ChatbotWidget({ compact = false }: { compact?: boolean }) {
  const [node, setNode] = useState<BotNode>(botOpening);
  const [messages, setMessages] = useState<Message[]>([
    { id: "opening", role: "bot", text: botOpening.message }
  ]);
  const [lead, setLead] = useState({ name: "", role: "", clinic: "", email: "", consent: false });
  const [submitted, setSubmitted] = useState(false);
  const [question, setQuestion] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const frameClass = useMemo(
    () => compact ? "h-[660px] max-h-[calc(100vh-2rem)]" : "h-[760px]",
    [compact]
  );

  async function choose(optionValue: string, optionLabel: string) {
    const next = getBotNode(optionValue);
    const nextMessages: Message[] = [
      ...messages,
      { id: `visitor-${Date.now()}`, role: "visitor", text: optionLabel },
      { id: `bot-${optionValue}-${Date.now()}`, role: "bot", text: next.message }
    ];

    setMessages(nextMessages);
    setNode(next);

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "option_selected", optionValue, optionLabel, transcript: nextMessages })
      });
    } catch {
      // Non-blocking analytics log.
    }
  }

  async function askQuestion() {
    const clean = question.trim();
    if (!clean || thinking) return;
    setQuestion("");
    setThinking(true);

    const questionMessages: Message[] = [
      ...messages,
      { id: `visitor-question-${Date.now()}`, role: "visitor", text: clean }
    ];
    setMessages(questionMessages);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "ask_question", question: clean, transcript: questionMessages })
      });
      const data = await response.json();
      const answer = data.answer || "I can answer general ABA operations and recovery workflow questions. Please do not submit patient information.";
      setMessages([
        ...questionMessages,
        { id: `bot-answer-${Date.now()}`, role: "bot", text: answer }
      ]);
    } catch {
      setMessages([
        ...questionMessages,
        { id: `bot-error-${Date.now()}`, role: "bot", text: "I had trouble answering that. Please try again without patient information, or use the calculator and Provider Portal links." }
      ]);
    } finally {
      setThinking(false);
    }
  }

  async function submitLead() {
    if (!lead.email || !lead.consent) return;
    setSubmitted(true);

    const nextMessages: Message[] = [
      ...messages,
      { id: `visitor-lead-${Date.now()}`, role: "visitor", text: `Requested follow-up for ${lead.clinic || "clinic"}.` },
      {
        id: `bot-thanks-${Date.now()}`,
        role: "bot",
        text: "Thank you. Your request was captured. We will not ask for patient information here."
      }
    ];

    setMessages(nextMessages);

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "lead_capture", lead, transcript: nextMessages })
      });
    } catch {
      // Non-blocking analytics log.
    }
  }

  return (
    <div className={`flex ${frameClass} flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft`}>
      <div className="border-b border-slate-200 bg-slate-950 p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Recovery Advisor</p>
        <h2 className="mt-2 text-xl font-black">Operations Recovery Guide</h2>
        <p className="mt-1 text-xs text-slate-300">General ABA operations assistant. No PHI. Not clinical advice.</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "visitor" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-3xl px-4 py-3 text-sm leading-6 ${
                message.role === "visitor" ? "bg-slate-950 text-white" : "bg-white text-slate-700 shadow-sm"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {thinking ? (
          <div className="flex justify-start">
            <div className="rounded-3xl bg-white px-4 py-3 text-sm font-semibold text-slate-500 shadow-sm">Thinking through the operational workflow…</div>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-200 bg-white p-4">
        {node.ctaHref ? (
          <a href={node.ctaHref} className="mb-3 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white">
            {node.ctaLabel ?? "Open"}
          </a>
        ) : null}

        {node.captureLead ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="input" placeholder="Name" value={lead.name} onChange={(event) => setLead((prev) => ({ ...prev, name: event.target.value }))} />
              <input className="input" placeholder="Role" value={lead.role} onChange={(event) => setLead((prev) => ({ ...prev, role: event.target.value }))} />
              <input className="input" placeholder="Clinic" value={lead.clinic} onChange={(event) => setLead((prev) => ({ ...prev, clinic: event.target.value }))} />
              <input className="input" placeholder="Email" type="email" value={lead.email} onChange={(event) => setLead((prev) => ({ ...prev, email: event.target.value }))} />
            </div>
            <label className="flex gap-3 text-xs leading-5 text-slate-600">
              <input type="checkbox" className="mt-1 h-4 w-4" checked={lead.consent} onChange={(event) => setLead((prev) => ({ ...prev, consent: event.target.checked }))} />
              <span>By providing my email, I agree Infinite Pieces AI may contact me about Infinite Suite OS™. I will not submit patient information.</span>
            </label>
            <button
              type="button"
              disabled={!lead.email || !lead.consent || submitted}
              onClick={submitLead}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitted ? "Captured" : "Request follow-up"}
            </button>
          </div>
        ) : node.options ? (
          <div className="flex flex-wrap gap-2">
            {node.options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => choose(option.value, option.label)}
                className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => choose("opening", "Start over")}
            className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700"
          >
            Start over
          </button>
        )}

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Ask a general operations question</label>
          <div className="mt-2 flex gap-2">
            <input
              className="input flex-1"
              placeholder="Example: How do ABA clinics estimate cancellation leakage?"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  askQuestion();
                }
              }}
            />
            <button
              type="button"
              onClick={askQuestion}
              disabled={!question.trim() || thinking}
              className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ask
            </button>
          </div>
          <p className="mt-2 text-[11px] font-semibold leading-5 text-slate-500">General field/admin guidance only. Do not include client names, PHI, treatment plans, payer IDs, or sensitive details.</p>
        </div>
      </div>
    </div>
  );
}
