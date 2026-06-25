export const runtime = "nodejs";
export async function POST() {
  return Response.json({ ok: false, fallback: "browser-speech", message: "Demo mode — using browser speech." });
}
