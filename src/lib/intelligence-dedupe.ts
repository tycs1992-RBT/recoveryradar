export type IntelligenceRecordType = "COMPANY" | "PERSON" | "SOURCE";

export type IntelligenceUpsertInput = {
  recordType: IntelligenceRecordType;
  name: string;
  companyName?: string;
  role?: string;
  website?: string;
  linkedinUrl?: string;
  sourceUrl?: string;
  publicEmail?: string;
  phone?: string;
  address?: string;
  cityState?: string;
  rating?: number;
  reviewCount?: number;
  leadScore?: number;
  sourceQuery?: string;
  sourceTool?: string;
  notes?: string;
};

export function normalizeText(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeUrl(value: unknown) {
  try {
    const raw = String(value ?? "").trim();
    if (!raw) return "";
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    url.hash = "";
    url.search = "";
    url.hostname = url.hostname.replace(/^www\./, "").toLowerCase();
    url.pathname = url.pathname.replace(/\/$/, "");
    return `${url.hostname}${url.pathname}`.toLowerCase();
  } catch {
    return normalizeText(value);
  }
}

export function extractDomain(value: unknown) {
  const normalized = normalizeUrl(value);
  return normalized.split("/")[0] ?? "";
}

export function buildIntelligenceKey(record: IntelligenceUpsertInput) {
  if (record.linkedinUrl) return `linkedin:${normalizeUrl(record.linkedinUrl)}`;
  if (record.website && record.recordType === "COMPANY") return `company-domain:${extractDomain(record.website)}`;
  if (record.publicEmail) return `email:${normalizeText(record.publicEmail)}`;
  if (record.sourceUrl && record.recordType === "SOURCE") return `source:${normalizeUrl(record.sourceUrl)}`;

  const name = normalizeText(record.name);
  const company = normalizeText(record.companyName);
  const market = normalizeText(record.cityState || record.address || record.sourceQuery);
  return `${record.recordType.toLowerCase()}:${name}:${company}:${market}`;
}

export function sortByName<T extends { name?: string; businessName?: string; companyName?: string }>(rows: T[]) {
  return [...rows].sort((a, b) => {
    const aName = normalizeText(a.name || a.businessName || a.companyName);
    const bName = normalizeText(b.name || b.businessName || b.companyName);
    return aName.localeCompare(bName);
  });
}

export function uniqueByKey<T>(rows: T[], keyBuilder: (row: T) => string) {
  const seen = new Set<string>();
  const unique: T[] = [];
  for (const row of rows) {
    const key = keyBuilder(row);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(row);
  }
  return unique;
}
