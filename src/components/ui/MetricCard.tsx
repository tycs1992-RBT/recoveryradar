import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string | number;
  delta?: string;
  helper?: string;
  className?: string;
};

export function MetricCard({ label, value, delta, helper, className }: MetricCardProps) {
  return (
    <div className={cn("card", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</p>
        </div>
        {delta ? <span className="badge bg-emerald-50 text-emerald-700">{delta}</span> : null}
      </div>
      {helper ? <p className="mt-4 text-sm leading-6 text-slate-500">{helper}</p> : null}
    </div>
  );
}
