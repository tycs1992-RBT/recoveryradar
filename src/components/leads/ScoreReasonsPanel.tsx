import { type LeadScoreResult } from "@/lib/lead-scoring";

export function ScoreReasonsPanel({ result }: { result: LeadScoreResult }) {
  return (
    <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="font-black text-slate-950">Lead score: {result.score}</span>
        <span className="badge bg-white">Tier: {result.tier.replaceAll("_", " ")}</span>
      </div>
      <div className="space-y-1">
        {result.reasons.length ? result.reasons.map((reason) => (
          <p key={`${reason.label}-${reason.points}`}>
            <span className={reason.points >= 0 ? "font-black text-emerald-700" : "font-black text-red-700"}>{reason.points > 0 ? "+" : ""}{reason.points}</span> {reason.label}
          </p>
        )) : <p>No score modifiers detected yet.</p>}
      </div>
    </div>
  );
}
