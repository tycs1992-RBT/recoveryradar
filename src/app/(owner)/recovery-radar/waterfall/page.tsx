import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOwnerRadarData } from "@/lib/owner-demo-data";
import { Panel, FunnelBars } from "@/components/owner/radar-ui";

export const metadata = { title: "Recovery Radar — Recovery Waterfall" };

const STEPS = ["Cancellation / callout", "Scheduler AI™", "Auth utilization check", "SubPool™", "FieldPocket™", "Care Pocket™", "Compliance Sentinel™", "Review-ready hour"];

export default async function WaterfallPage() {
  const session = await getServerSession(authOptions);
  const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
  const d = getOwnerRadarData(tenantId);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.35em] text-cyan-400">Recovery Waterfall™</p>
        <h1 className="mt-2 text-5xl font-black tracking-tight text-white">How sessions get recovered</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
          The Recovery Waterfall routes each at-risk session to the best available recovery path. This is the mix that produced your recovered hours.
        </p>
      </div>

      <Panel eyebrow="The flow" title="From callout to review-ready hour">
        <div className="flex flex-wrap items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-200">{s}</span>
              {i < STEPS.length - 1 ? <span className="text-cyan-400">→</span> : null}
            </div>
          ))}
        </div>
      </Panel>

      <Panel eyebrow="Recovered sessions" title="By recovery method">
        <FunnelBars rows={d.byMethod.map((m) => ({ label: m.method, value: m.recoveredSessions, share: m.share }))} />
      </Panel>

      <p className="text-xs font-semibold text-slate-500">De-identified demo data. In-person makeups keep the same billing code; telehealth parent-training swaps codes and unlocks supported admin time — every step is human-reviewed, never auto-billed.</p>
    </div>
  );
}
