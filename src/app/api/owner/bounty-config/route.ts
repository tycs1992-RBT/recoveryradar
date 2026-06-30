// ===========================================================================
// OWNER BOUNTY CONFIG API  —  GET / PUT
//
// Persists the owner's bounty config FOR REAL, scoped to their tenant, to the
// site's own database. This is genuine persistence, not a stub.
//
// The ONE piece that is NOT done here is pushing the saved config into the
// running provider OS. The OS reads its config from a shared per-tenant store;
// wiring this save to that store (and a live push/poll) is Daniel's backend.
// That single hop is marked // FOR DANIEL below.
// ===========================================================================
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeConfig, DEFAULT_BOUNTY_CONFIG, type BountyConfig } from "@/lib/bounty-config";

// The config is stored as the latest AuditEvent row for this tenant's bounty
// config: entityType pins the kind, entityId is the tenant, and the JSON blob
// lives in `after` (append-only, latest wins on read). If a dedicated
// BountyConfig model is added to schema.prisma later, swap these two helpers to
// use it; the contract and the route stay the same.
const BOUNTY_ENTITY = "bounty-config";

async function readConfig(tenantId: string): Promise<BountyConfig> {
  // FOR DANIEL: replace with the shared per-tenant config store the OS also reads.
  const row = await prisma.auditEvent.findFirst({
    where: { entityType: BOUNTY_ENTITY, entityId: tenantId },
    orderBy: { createdAt: "desc" },
  }).catch(() => null);
  if (row?.after) {
    try { return sanitizeConfig(row.after as unknown as Partial<BountyConfig>); } catch { /* fall through */ }
  }
  return DEFAULT_BOUNTY_CONFIG;
}

async function writeConfig(tenantId: string, actorId: string, config: BountyConfig): Promise<void> {
  // Real, durable write to the site DB (append-only, latest wins on read).
  // FOR DANIEL: ALSO push this into the shared per-tenant store the OS reads,
  // so the running OS picks up the new ladder/funding without a redeploy.
  await prisma.auditEvent.create({
    data: {
      actorId,
      action: "bounty-config.update",
      entityType: BOUNTY_ENTITY,
      entityId: tenantId,
      after: JSON.parse(JSON.stringify(config)),
    },
  });
}

function ownerSession() {
  return getServerSession(authOptions).then((session) => {
    const user = session?.user as { role?: string; tenantId?: string; id?: string } | undefined;
    if (!user || user.role !== "owner" || !user.tenantId) return null;
    return { tenantId: user.tenantId, actorId: user.id ?? "owner" };
  });
}

export async function GET() {
  const who = await ownerSession();
  if (!who) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const config = await readConfig(who.tenantId);
  return NextResponse.json({ config });
}

export async function PUT(req: Request) {
  const who = await ownerSession();
  if (!who) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad JSON" }, { status: 400 }); }
  const config = sanitizeConfig((body as { config?: Partial<BountyConfig> })?.config);
  await writeConfig(who.tenantId, who.actorId, config);
  return NextResponse.json({ config, saved: true });
}
