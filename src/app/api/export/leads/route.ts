import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/utils";

export async function GET() {
  let rows: Array<Record<string, unknown>> = [];

  if (process.env.DATABASE_URL) {
    try {
      const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
      rows = leads.map((lead) => ({
        id: lead.id,
        createdAt: lead.createdAt.toISOString(),
        source: lead.source,
        companyName: lead.companyName,
        contactName: lead.contactName,
        contactRole: lead.contactRole,
        state: lead.state,
        website: lead.website,
        publicEmail: lead.publicEmail,
        currentEmr: lead.currentEmr,
        painPoint: lead.painPoint,
        leadScore: lead.leadScore,
        status: lead.status,
        nextStep: lead.nextStep
      }));
    } catch {
      rows = [];
    }
  }

  const csv = toCsv(rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=recovery-radar-live-leads.csv"
    }
  });
}
