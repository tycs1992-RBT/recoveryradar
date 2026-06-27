import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions, type AppRole } from "./auth";
import { can } from "./rbac";

/**
 * Guard for founder/internal workspace API routes (leads, CRM, outreach, export, intel).
 * Returns a 401 NextResponse if the caller is NOT an authenticated founder-workspace user
 * (admin/growth), or null if the request may proceed.
 *
 * NOTE: this intentionally checks the "workspace" permission, NOT "read". The clinic-owner
 * role also has "read" (for Recovery Radar), so a plain read-check would let a customer reach
 * the founder's internal data. Only admin/growth hold "workspace".
 */
export async function requireWorkspace(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: AppRole } | undefined)?.role;
  if (!session || !can(role, "workspace")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
