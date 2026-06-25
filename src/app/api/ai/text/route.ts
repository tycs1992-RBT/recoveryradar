import { demoJson } from "@/lib/infinite-suite-demo";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const text = (demoJson(body) as { text?: string }).text || "Demo backend draft. Human review required.";
  return Response.json({ ok: true, text, reviewRequired: true });
}
