export const runtime = "nodejs";
export async function GET() {
  return Response.json({ ok: true, service: "Infinite Suite OS Demo API", demoMode: true, now: new Date().toISOString() });
}
