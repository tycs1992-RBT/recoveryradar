import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOwnerRadarData } from "@/lib/owner-demo-data";
import { RecoverySimulator } from "@/components/owner/RecoverySimulator";

export const metadata = { title: "Recovery Radar — ROI Simulator" };

export default async function SimulatorPage() {
  const session = await getServerSession(authOptions);
  const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
  const d = getOwnerRadarData(tenantId);

  // Seed the simulator from the clinic's known numbers. For the demo tenant these are the
  // sample clinic's; for a real owner, Daniel's pipe fills initialInputs from their account
  // (and a brand-new owner can "Clear for live data" and enter their own).
  const totalAtRisk = d.bySetting.reduce((s, x) => s + x.atRiskSessions, 0);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.35em] text-cyan-400">{d.clinicName}</p>
        <h1 className="mt-2 text-5xl font-black tracking-tight text-white">ROI Simulator</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
          Project what recovery is worth to your clinic over time. The fields start from your clinic&apos;s
          numbers{totalAtRisk ? "" : " (or zeroed, ready for your data)"} — adjust any of them and run the months
          forward. Use clinic-level numbers only; no patient information.
        </p>
      </div>

      <RecoverySimulator variant="owner" />
    </div>
  );
}
