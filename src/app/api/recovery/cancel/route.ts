import { newId } from "@/lib/infinite-suite-demo";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));
  const packet = {
    id: newId("recovery"),
    clientRef: body.clientRef || "Client A",
    reason: body.reason || "Caregiver cancellation",
    makeupWindows: body.makeupWindows || ["Friday 3 PM", "Saturday 10 AM"],
    route: ["Care Pocket™ captured cancellation", "Scheduler AI™ opened recovery waterfall", "Auth War Room™ checked 97153/97156", "SubPool™ direct makeup or Analyst Pocket™ 97156 fallback", "Material Maker™ prep fallback if clinical recovery blocked", "Compliance Sentinel™ packet staged"],
    reviewRequired: true,
    createdAt: new Date().toISOString()
  };
  return Response.json({ ok: true, packet });
}
