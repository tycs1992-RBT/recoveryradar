import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeConfig, DEFAULT_BOUNTY_CONFIG, type BountyConfig } from "@/lib/bounty-config";
import { BountyControls } from "@/components/owner/BountyControls";

export const metadata = { title: "Recovery Radar — Recovery Incentives" };

// Read the tenant's saved config server-side so the controls hydrate with real
// saved values. Mirrors the read in /api/owner/bounty-config.
// FOR DANIEL: this read (and the API write) should target the shared per-tenant
// store the provider OS also reads, so the two stay in lockstep.
async function loadConfig(tenantId: string | undefined): Promise<BountyConfig> {
  if (!tenantId) return DEFAULT_BOUNTY_CONFIG;
  const row = await prisma.auditEvent
    .findFirst({ where: { entityType: "bounty-config", entityId: tenantId }, orderBy: { createdAt: "desc" } })
    .catch(() => null);
  if (row?.after) {
    try { return sanitizeConfig(row.after as unknown as Partial<BountyConfig>); } catch { /* fall through */ }
  }
  return DEFAULT_BOUNTY_CONFIG;
}

export default async function RecoveryIncentivesPage() {
  const session = await getServerSession(authOptions);
  const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
  const config = await loadConfig(tenantId);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.35em] text-emerald-300">Protect the hour</p>
        <h1 className="mt-2 text-5xl font-black tracking-tight text-white">Recovery incentives</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-400">
          Set and fund the bounty your clinic offers to recover an at-risk session. The reward is driven by how
          soon the session starts and climbs as the clock runs down. You fund the pool and approve every reward,
          and on a billable makeup a recovered hour more than covers the incentive.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] px-5 py-4 text-sm leading-6 text-amber-100/90">
        <span className="font-black text-amber-200">How this connects.</span>{" "}
        Saving here stores your settings to your account. The provider app reads this same configuration to set
        live bounties. The real-time link between this command center and the running app is part of the secure
        backend buildout, so until that is connected, your saved settings apply the next time the app loads its config.
      </div>

      <BountyControls initialConfig={config} />
    </div>
  );
}
