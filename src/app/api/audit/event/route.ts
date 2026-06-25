import { auditEvent } from "@/lib/infinite-suite-demo";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  return Response.json({ ok: true, event: auditEvent(body?.eventName || "audit.event", body?.payload || {}) });
}
