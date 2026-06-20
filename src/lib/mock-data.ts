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

export const mockLeads: MockLead[] = [
  {
    id: "lead_001",
    createdAt: "2026-06-15",
    source: "intent_finder",
    companyName: "Bright Beginnings ABA",
    contactName: "Dr. Jane Smith",
    contactRole: "Founder/CEO",
    city: "Tampa",
    state: "FL",
    website: "https://brightbeginningsaba.example",
    currentEmr: "CentralReach",
    painPoint: "scheduling issues",
    clinicSize: 42,
    serviceModel: "center + in-home hybrid",
    leadScore: 75,
    status: "new",
    nextStep: "Send founder connection note",
    notes:
      "Fictional seed lead. Press release announced opening new center in Tampa. Hiring BCBAs and schedulers; mentions scheduling issues.",
    signals: [
      { type: "new_clinic", detail: "Opening new center in Tampa" },
      { type: "aba_provider", detail: "ABA services listed" },
      { type: "founder_role", detail: "Founder/CEO identified" },
      { type: "hiring_scheduler", detail: "Scheduler job post" },
      { type: "scheduling_issues", detail: "Public scheduling software post" },
      { type: "hybrid", detail: "Hybrid service model" },
      { type: "regional_provider", detail: "Regional clinic" }
    ]
  },
  {
    id: "lead_002",
    createdAt: "2026-06-16",
    source: "calculator",
    companyName: "Pathways Therapy Group",
    contactRole: "Operations Manager",
    state: "TX",
    website: "https://pathwaystherapygroup.example",
    currentEmr: "Rethink",
    painPoint: "20% cancellations and high admin time",
    clinicSize: 50,
    serviceModel: "center",
    leadScore: 58,
    status: "research",
    nextStep: "Invite to recovery workflow demo",
    notes:
      "Fictional seed lead. Completed calculator with 50 clients, 2 sessions/week, 20% cancellations and high admin time.",
    signals: [
      { type: "aba_provider", detail: "ABA services listed" },
      { type: "operations_pain", detail: "Calculator showed high admin burden" },
      { type: "regional_provider", detail: "Regional clinic" }
    ]
  },
  {
    id: "lead_003",
    createdAt: "2026-06-17",
    source: "quiz",
    companyName: "ABA Kids Care",
    contactName: "Emily Johnson",
    contactRole: "Scheduler",
    state: "CA",
    website: "https://abakidscare.example",
    currentEmr: "Motivity",
    painPoint: "cancellations and callouts",
    clinicSize: 80,
    serviceModel: "in-home",
    leadScore: 45,
    status: "connection_requested",
    nextStep: "Follow up with scheduler workflow note",
    notes:
      "Fictional seed lead. Quiz identified Recovery Layer Candidate with shopping timeline within six months.",
    signals: [
      { type: "aba_provider", detail: "ABA services listed" },
      { type: "cancellations", detail: "Quiz pain point" },
      { type: "in_home", detail: "In-home model" },
      { type: "regional_provider", detail: "Regional clinic" }
    ]
  }
];

export const mockIntentSignals = [
  {
    id: "signal_001",
    leadId: "lead_001",
    signalType: "new_clinic",
    signalDetail: "Press release: Bright Beginnings ABA expands to Tampa.",
    signalSourceUrl: "https://news.example/bright-beginnings-tampa",
    detectedAt: "2026-06-15"
  },
  {
    id: "signal_002",
    leadId: "lead_001",
    signalType: "hiring_bcba",
    signalDetail: "Job posting: Hiring BCBAs and RBTs for new center.",
    signalSourceUrl: "https://jobs.example/bright-beginnings-aba-hiring",
    detectedAt: "2026-06-15"
  },
  {
    id: "signal_003",
    leadId: "lead_001",
    signalType: "scheduling_issues",
    signalDetail: "Blog post: Why we’re rethinking our scheduling software.",
    signalSourceUrl: "https://blog.example/bright-beginnings-scheduling",
    detectedAt: "2026-06-15"
  }
];

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

export const mockTasks: MockTask[] = [
  {
    id: "task_001",
    leadId: "lead_001",
    title: "Review Bright Beginnings ABA and send founder connection note",
    due: "Today",
    dueDate: "2026-06-19",
    status: "PENDING",
    taskType: "CONNECTION_NOTE",
    type: "connection_note",
    assignedTo: "Ty | Infinite Pieces AI",
    priority: "high"
  },
  {
    id: "task_002",
    leadId: "lead_002",
    title: "Send Pathways lost-hours report and invite to recovery workflow demo",
    due: "Tomorrow",
    dueDate: "2026-06-20",
    status: "PENDING",
    taskType: "EMAIL_FOLLOWUP",
    type: "email_followup",
    assignedTo: "Ty | Infinite Pieces AI",
    priority: "medium"
  },
  {
    id: "task_003",
    leadId: "lead_003",
    title: "Prepare founding clinic beta invite after scheduler reply",
    due: "Friday",
    dueDate: "2026-06-21",
    status: "APPROVED",
    taskType: "INMAIL",
    type: "inmail",
    assignedTo: "Ty | Infinite Pieces AI",
    priority: "medium"
  }
];

export const mockAnalytics = [
  { label: "Visitors", value: 1240, delta: "+18%" },
  { label: "Calculator starts", value: 186, delta: "+24%" },
  { label: "Calculator completions", value: 92, delta: "+12%" },
  { label: "Quiz completions", value: 64, delta: "+9%" },
  { label: "Provider Portal clicks", value: 41, delta: "+15%" },
  { label: "Demo requests", value: 12, delta: "+6%" }
];

export { keywordGroups };
