import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildIntelligenceKey, normalizeText } from "@/lib/intelligence-dedupe";

const recordSchema = z.object({
  recordType: z.enum(["COMPANY", "PERSON", "SOURCE"]).default("COMPANY"),
  name: z.string().trim().min(1),
  companyName: z.string().trim().optional(),
  role: z.string().trim().optional(),
  website: z.string().trim().optional(),
  linkedinUrl: z.string().trim().optional(),
  sourceUrl: z.string().trim().optional(),
  publicEmail: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  cityState: z.string().trim().optional(),
  leadScore: z.number().optional(),
  sourceQuery: z.string().trim().optional(),
  sourceTool: z.string().trim().optional(),
  notes: z.string().trim().optional()
});

const upsertSchema = z.object({
  records: z.array(recordSchema).min(1).max(500)
});

function stateFromCityState(cityState?: string) {
  const parts = (cityState ?? "").split(",").map((part) => part.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : undefined;
}

function cityFromCityState(cityState?: string) {
  const parts = (cityState ?? "").split(",").map((part) => part.trim()).filter(Boolean);
  return parts.length > 1 ? parts.slice(0, -1).join(", ") : cityState;
}

async function saveCompany(record: z.infer<typeof recordSchema>) {
  const existing = await prisma.company.findFirst({
    where: {
      OR: [
        record.website ? { website: record.website } : undefined,
        { name: { equals: record.companyName || record.name, mode: "insensitive" } }
      ].filter(Boolean) as Array<{ website?: string; name?: { equals: string; mode: "insensitive" } }>
    }
  });

  const data = {
    name: record.companyName || record.name,
    website: record.website || existing?.website,
    city: cityFromCityState(record.cityState) || existing?.city,
    state: stateFromCityState(record.cityState) || existing?.state,
    notes: [existing?.notes, record.notes, record.sourceUrl ? `Source: ${record.sourceUrl}` : "", record.sourceQuery ? `Query: ${record.sourceQuery}` : ""].filter(Boolean).join("\n")
  };

  if (existing) return prisma.company.update({ where: { id: existing.id }, data });
  return prisma.company.create({ data });
}

async function saveContact(record: z.infer<typeof recordSchema>) {
  const company = await saveCompany({ ...record, recordType: "COMPANY", name: record.companyName || record.name });
  const existing = await prisma.contact.findFirst({
    where: {
      companyId: company.id,
      OR: [
        record.linkedinUrl ? { linkedinUrl: record.linkedinUrl } : undefined,
        record.publicEmail ? { publicEmail: record.publicEmail } : undefined,
        { name: { equals: record.name, mode: "insensitive" } }
      ].filter(Boolean) as Array<{ linkedinUrl?: string; publicEmail?: string; name?: { equals: string; mode: "insensitive" } }>
    }
  });

  const data = {
    companyId: company.id,
    name: record.name,
    role: record.role || existing?.role,
    publicEmail: record.publicEmail || existing?.publicEmail,
    publicPhone: record.phone || existing?.publicPhone,
    linkedinUrl: record.linkedinUrl || existing?.linkedinUrl,
    notes: [existing?.notes, record.notes, record.sourceUrl ? `Source: ${record.sourceUrl}` : "", record.sourceQuery ? `Query: ${record.sourceQuery}` : ""].filter(Boolean).join("\n")
  };

  if (existing) return prisma.contact.update({ where: { id: existing.id }, data });
  return prisma.contact.create({ data });
}

async function saveLead(record: z.infer<typeof recordSchema>) {
  const companyName = record.companyName || record.name;
  const existing = await prisma.lead.findFirst({
    where: {
      OR: [
        record.website ? { website: record.website } : undefined,
        record.publicEmail ? { publicEmail: record.publicEmail } : undefined,
        { companyName: { equals: companyName, mode: "insensitive" } }
      ].filter(Boolean) as Array<{ website?: string; publicEmail?: string; companyName?: { equals: string; mode: "insensitive" } }>
    }
  });

  const data = {
    companyName,
    contactName: record.recordType === "PERSON" ? record.name : existing?.contactName,
    contactRole: record.role || existing?.contactRole,
    city: cityFromCityState(record.cityState) || existing?.city,
    state: stateFromCityState(record.cityState) || existing?.state,
    website: record.website || existing?.website,
    publicEmail: record.publicEmail || existing?.publicEmail,
    sourceUrl: record.sourceUrl || existing?.sourceUrl,
    linkedinSearchQuery: record.linkedinUrl || existing?.linkedinSearchQuery,
    leadScore: Math.max(record.leadScore ?? 0, existing?.leadScore ?? 0),
    notes: [existing?.notes, record.notes, record.sourceQuery ? `Query: ${record.sourceQuery}` : ""].filter(Boolean).join("\n")
  };

  if (existing) return prisma.lead.update({ where: { id: existing.id }, data });
  return prisma.lead.create({ data: { ...data, source: "IMPORT" } });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [companies, contacts, leads] = await Promise.all([
    prisma.company.findMany({ orderBy: { name: "asc" }, take: 500 }),
    prisma.contact.findMany({ orderBy: { name: "asc" }, include: { company: true }, take: 500 }),
    prisma.lead.findMany({ orderBy: { companyName: "asc" }, take: 500 })
  ]);

  const merged = new Map<string, Record<string, unknown>>();

  for (const company of companies) {
    const key = buildIntelligenceKey({ recordType: "COMPANY", name: company.name, website: company.website ?? undefined, cityState: [company.city, company.state].filter(Boolean).join(", ") });
    merged.set(key, { type: "COMPANY", name: company.name, companyName: company.name, website: company.website, cityState: [company.city, company.state].filter(Boolean).join(", "), source: "Company bank", updatedAt: company.updatedAt });
  }

  for (const contact of contacts) {
    const key = buildIntelligenceKey({ recordType: "PERSON", name: contact.name || "Unknown", companyName: contact.company.name, linkedinUrl: contact.linkedinUrl ?? undefined, publicEmail: contact.publicEmail ?? undefined });
    merged.set(key, { type: "PERSON", name: contact.name, role: contact.role, companyName: contact.company.name, linkedinUrl: contact.linkedinUrl, publicEmail: contact.publicEmail, phone: contact.publicPhone, source: "Contact bank", updatedAt: contact.updatedAt });
  }

  for (const lead of leads) {
    const key = buildIntelligenceKey({ recordType: "COMPANY", name: lead.companyName, website: lead.website ?? undefined, publicEmail: lead.publicEmail ?? undefined, cityState: [lead.city, lead.state].filter(Boolean).join(", ") });
    if (!merged.has(key)) {
      merged.set(key, { type: "LEAD", name: lead.contactName || lead.companyName, role: lead.contactRole, companyName: lead.companyName, website: lead.website, publicEmail: lead.publicEmail, sourceUrl: lead.sourceUrl, cityState: [lead.city, lead.state].filter(Boolean).join(", "), leadScore: lead.leadScore, source: "Lead bank", updatedAt: lead.updatedAt });
    }
  }

  const records = Array.from(merged.values()).sort((a, b) => normalizeText(a.name || a.companyName).localeCompare(normalizeText(b.name || b.companyName)));
  return NextResponse.json({ records, count: records.length });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid intelligence bank request", issues: parsed.error.flatten() }, { status: 400 });

  const keys = new Set<string>();
  const records = parsed.data.records.filter((record) => {
    const key = buildIntelligenceKey(record);
    if (keys.has(key)) return false;
    keys.add(key);
    return true;
  }).sort((a, b) => normalizeText(a.name).localeCompare(normalizeText(b.name)));

  let companiesSaved = 0;
  let contactsSaved = 0;
  let leadsSaved = 0;

  for (const record of records) {
    if (record.recordType === "PERSON") {
      await saveContact(record);
      contactsSaved += 1;
    } else {
      await saveCompany(record);
      companiesSaved += 1;
    }
    await saveLead(record);
    leadsSaved += 1;
  }

  return NextResponse.json({
    saved: records.length,
    companiesSaved,
    contactsSaved,
    leadsSaved,
    skippedDuplicatesInBatch: parsed.data.records.length - records.length,
    notice: "Saved to Intelligence Bank with duplicate checks across company name, website, public email and LinkedIn URL."
  });
}
