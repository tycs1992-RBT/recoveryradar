import { newId, stripPhi } from "@/lib/infinite-suite-demo";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const packet = {
    id: body.id || newId("handoff"),
    sourceModuleId: stripPhi(body.sourceModuleId || "motherboard-os"),
    targetModuleId: stripPhi(body.targetModuleId || "manual-review"),
    eventName: stripPhi(body.eventName || "os.moduleRouteRequested"),
    payload: body.payload || {},
    context: body.context || {},
    reviewRequired: true,
    demoOnly: true,
    createdAt: new Date().toISOString()
  };
  return Response.json({ ok: true, packet });
}
