import { auditEvent, newId } from "@/lib/infinite-suite-demo";
export const runtime = "nodejs";
export async function POST(req: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  if (!["start", "pause", "resume", "end"].includes(action)) {
    return Response.json({ ok: false, error: "Invalid session action" }, { status: 400 });
  }
  const body = await req.json().catch(() => ({} as any));
  const event = auditEvent(`session.${action}`, { moduleId: "motherboard-os", ...body });
  return Response.json({ ok: true, action, proofPacket: { sessionId: body.sessionId || newId("session"), action, timestamp: event.createdAt, gps: body.gps || "demo-soft", geofence: body.geofence || "not captured", reviewRequired: true } });
}
