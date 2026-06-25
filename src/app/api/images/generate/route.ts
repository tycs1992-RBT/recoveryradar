import { svgUrl, stripPhi } from "@/lib/infinite-suite-demo";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));
  const prompt = stripPhi(body.prompt || "Visual Support");
  return Response.json({ ok: true, imageUrl: svgUrl(prompt, body.aspectRatio || "1:1"), demo: true, reviewRequired: true });
}
