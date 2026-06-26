import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOwnerRadarData } from "@/lib/owner-demo-data";

export const metadata = { title: "Recovery Radar — Alerts" };

const sev: Record<string, string> = {
  high: "border-rose-400/30 bg-rose-400/[0.07] text-rose-200",
  medium: "border-amber-400/30 bg-amber-400/[0.07] text-amber-200",
  low: "border-emerald-400/30 bg-emerald-400/[0.07] text-emerald-200"
};

export default async function AlertsPage() {
  const session = await getServerSession(authOptions);
  const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
  const d = getOwnerRadarData(tenantId);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.35em] text-cyan-400">Signals</p>
        <h1 className="mt-2 text-5xl font-black tracking-tight text-white">What needs your attention</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">Radar flags where recovery is slipping so you can act before hours are lost for good.</p>
      </div>
      <div className="space-y-3">
        {d.alerts.map((a) => (
          <div key={a.title} className={`rounded-2xl border p-5 ${sev[a.severity]}`}>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide">{a.severity}</span>
              <h2 className="text-base font-black text-white">{a.title}</h2>
            </div>
            <p className="mt-2 text-sm font-semibold leading-6">{a.detail}</p>
          </div>
        ))}
      </div>
      <p className="text-xs font-semibold text-slate-500">De-identified demo signals. These are operational prompts for a human to review, not automated actions.</p>
    </div>
  );
}
