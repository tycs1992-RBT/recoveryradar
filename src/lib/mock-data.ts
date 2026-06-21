import type { LeadScoringInput } from "./lead-scoring";
import { keywordGroups } from "./constants";

export type MockLead = {
  id: string;
  createdAt: string;
  source: string;
  companyName: string;
  contactName?: string;
  contactRole?: string;
  city?: string;
  state?: string;
  website?: string;
  currentEmr?: string;
  painPoint?: string;
  clinicSize?: number;
  serviceModel?: string;
  leadScore: number;
  status: string;
  nextStep?: string;
  notes: string;
  signals: LeadScoringInput["signals"];
};

// Production clean-slate mode: no fictional leads are shipped to the UI.
// Real records should come from Google Places/search, website enrichment, calculator/quiz submissions, HubSpot, or Postgres.
export const mockLeads: MockLead[] = [];

export const mockIntentSignals: Array<{
  id: string;
  leadId: string;
  signalType: string;
  signalDetail: string;
  signalSourceUrl: string;
  detectedAt: string;
}> = [];

export type MockTask = {
  id: string;
  leadId: string;
  title: string;
  due: string;
  dueDate: string;
  status: "PENDING" | "APPROVED" | "SENT" | "COMPLETED" | "CANCELLED";
  taskType: "CONNECTION_NOTE" | "INMAIL" | "EMAIL_FOLLOWUP" | "CALL";
  type: string;
  assignedTo?: string;
  priority: "high" | "medium" | "low";
  generatedMessage?: string;
};

export const mockTasks: MockTask[] = [];

export const mockAnalytics = [
  { label: "Visitors", value: 0, delta: "live" },
  { label: "Calculator starts", value: 0, delta: "live" },
  { label: "Calculator completions", value: 0, delta: "live" },
  { label: "Quiz completions", value: 0, delta: "live" },
  { label: "Provider Portal clicks", value: 0, delta: "live" },
  { label: "Demo requests", value: 0, delta: "live" }
];

export { keywordGroups };
