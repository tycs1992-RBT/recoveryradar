import { NextResponse } from "next/server";
import { outreachTemplates } from "@/lib/outreach";

export async function GET() {
  return NextResponse.json({ templates: outreachTemplates, source: "local-library" });
}
