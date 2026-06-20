import { cn } from "@/lib/utils";

export function ScorePill({ score }: { score: number }) {
  const tier = score >= 60 ? "Hot" : score >= 30 ? "Research" : "Low";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-black",
        score >= 60 && "bg-emerald-100 text-emerald-800",
        score >= 30 && score < 60 && "bg-amber-100 text-amber-800",
        score < 30 && "bg-slate-100 text-slate-600"
      )}
    >
      {score} · {tier}
    </span>
  );
}
