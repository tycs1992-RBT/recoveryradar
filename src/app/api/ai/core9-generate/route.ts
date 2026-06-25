import { demoCore9Generate, stripPhi } from "@/lib/infinite-suite-demo";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const data = demoCore9Generate({
    moduleId: stripPhi(String(body.moduleId ?? "motherboard-os")).slice(0, 80),
    action: stripPhi(String(body.action ?? "core9-generate")).slice(0, 100),
    featureId: stripPhi(String(body.featureId ?? body.action ?? "core9")).slice(0, 100),
    context: body.context && typeof body.context === "object" ? body.context : {}
  });
  return Response.json({ ok: true, data, reviewRequired: true, demoOnly: true });
}
