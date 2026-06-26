export type OutreachLead = {
  contactName?: string | null;
  contactRole?: string | null;
  companyName?: string | null;
  currentEmr?: string | null;
  painPoint?: string | null;
};

export const outreachTemplates = [
  {
    templateName: "Founder LinkedIn Connection",
    channel: "LinkedIn_note",
    personaTarget: "Founder/CEO",
    maxLength: 300,
    body:
      "Hi {{contactName}}—I’m an RBT/founder building Infinite Suite OS™, a no-migration recovery workflow for ABA clinics. I’m focused on cancellations, callouts, staff support, caregiver communication and review-ready documentation. I’d value your operator perspective."
  },
  {
    templateName: "Clinical Director LinkedIn Connection",
    channel: "LinkedIn_note",
    personaTarget: "Clinical Director",
    maxLength: 300,
    body:
      "Hi {{contactName}}, as a clinical director you probably see cancellations and RBT callouts every week. I’m building Infinite Suite OS™ to recover lost hours beside your EMR. Would love to connect and hear your feedback."
  },
  {
    templateName: "Operations Manager LinkedIn Connection",
    channel: "LinkedIn_note",
    personaTarget: "Operations Manager",
    maxLength: 300,
    body:
      "Hi {{contactName}}, working in ABA ops is tough! I’m building a recovery layer that sits beside existing EMRs to reduce scheduling scramble, support staff and improve documentation. Can we connect?"
  },
  {
    templateName: "Scheduler LinkedIn Connection",
    channel: "LinkedIn_note",
    personaTarget: "Scheduler/Admin",
    maxLength: 300,
    body:
      "Hi {{contactName}}, I’m building a no-migration tool that sits beside existing EMRs to help schedulers route cancellations into recovered sessions and relieve manual scramble. Can we connect?"
  },
  {
    templateName: "Recovery Workflow InMail",
    channel: "LinkedIn_inmail",
    personaTarget: "Operator",
    maxLength: 2000,
    body:
      "Subject: Recover lost ABA hours without switching EMRs\n\nHi {{contactName}},\n\nI’m {{senderName}}, an RBT and founder of Infinite Suite OS™—a no-migration operational recovery layer for ABA clinics. We help clinics route cancelled sessions and callouts into recovered, supported, review-ready hours without replacing their EMR. Scheduler AI™, SubPool™, Care Pocket™ and Compliance Sentinel™ sit beside your EMR to recover lost hours, support staff and keep caregivers informed.\n\nI’m looking for honest feedback from ABA operators. Would you be open to a 15–20 minute demo and discussion? If it’s not a fit, no hard feelings, and I’ll respect your time.\n\nRegards,\n{{senderName}}\n\nP.S. Please reply “unsubscribe” if you prefer not to hear from me."
  },
  {
    templateName: "Email 1 - Welcome & Value",
    channel: "email",
    personaTarget: "EMR Shopper",
    maxLength: 4000,
    body:
      "Subject: Before you switch EMRs, check your lost hours\n\nHi {{contactName}},\n\nThanks for exploring Infinite Suite OS™. Many clinics believe their EMR is the problem, but often the real issue is operational recovery—cancellations, staff callouts and documentation gaps leak authorized hours. Infinite Suite OS™ sits beside your EMR to recover those hours. Use our Lost Hours Calculator to estimate your hours at risk and see how much revenue you could recover.\n\nRegards,\n{{senderName}}\n\nThis email is a commercial message from Infinite Pieces AI. Our address is {{physicalAddress}}. Reply “unsubscribe” or use the opt-out link to stop future emails."
  },
  {
    templateName: "Email 2 - Education & Recovery Workflow",
    channel: "email",
    personaTarget: "Recovery Candidate",
    maxLength: 4000,
    body:
      "Subject: Recover cancellations & callouts without a costly migration\n\nHi {{contactName}},\n\nA cancelled ABA session can become a recovered, supported, documented hour with the right workflow. Scheduler AI™ detects recovery options, Auth War Room checks authorization readiness, SubPool™ posts the opportunity, and FieldPocket™ supports the session. It sits beside your current EMR instead of forcing a migration. Want to see how this could work for {{companyName}}?\n\nRegards,\n{{senderName}}\n\nCommercial message from Infinite Pieces AI. Address: {{physicalAddress}}. Reply “unsubscribe” or use the opt-out link to stop future emails."
  },
  {
    templateName: "Email 3 - Demo or Beta Invite",
    channel: "email",
    personaTarget: "Beta Candidate",
    maxLength: 4000,
    body:
      "Subject: Invitation to Recovery Workflow Demo\n\nHi {{contactName}},\n\nI’d love to give you a 20-minute walkthrough of Infinite Suite OS™ and our recovery workflow. You’ll see how cancellations and callouts are routed into recovered sessions beside your EMR. We’re also preparing a small Founding Clinic beta with a free trial in exchange for structured feedback and anonymized operational recovery data.\n\nRegards,\n{{senderName}}\n\nCommercial message from Infinite Pieces AI. Address: {{physicalAddress}}. Reply “unsubscribe” or use the opt-out link to stop future emails."
  },
  {
    templateName: "Email 4 - Last Call / Nurture",
    channel: "email",
    personaTarget: "Nurture",
    maxLength: 4000,
    body:
      "Subject: Last call to calculate your lost hours\n\nHi {{contactName}},\n\nI haven’t heard back yet. If recovering lost hours isn’t a priority right now, no worries—just reply “unsubscribe” and I won’t follow up. If you’d still like to explore a recovery layer beside your current EMR, here’s the Lost Hours Calculator one more time.\n\nRegards,\n{{senderName}}\n\nCommercial message from Infinite Pieces AI. Address: {{physicalAddress}}. Reply “unsubscribe” or use the opt-out link to stop future emails."
  }
];

export function mergeTemplate(
  body: string,
  lead: OutreachLead | undefined,
  senderName = "Infinite Pieces AI Team",
  physicalAddress = "[physical address]"
) {
  const safeLead = lead ?? ({} as Partial<OutreachLead>);
  const values: Record<string, string> = {
    contactName: safeLead.contactName || "there",
    contactRole: safeLead.contactRole || "operator",
    companyName: safeLead.companyName || "your clinic",
    currentEmr: safeLead.currentEmr || "your current EMR",
    painPoint: safeLead.painPoint || "lost hours",
    senderName,
    physicalAddress
  };

  return body.replace(/{{(.*?)}}/g, (_, key: string) => values[key.trim()] ?? "");
}

export function complianceChecklist(channel: string) {
  const base = [
    "Human approval required before send.",
    "Do not imply a prior relationship unless one exists.",
    "Do not include patient information or ask the recipient to send PHI.",
    "Use only public or opted-in contact information."
  ];

  if (channel === "email") {
    base.push("Use accurate sender/header information.");
    base.push("Use a truthful subject line.");
    base.push("Identify the message as commercial where appropriate.");
    base.push("Include a physical postal address.");
    base.push("Include an opt-out path and honor opt-outs promptly.");
  }

  return base;
}
