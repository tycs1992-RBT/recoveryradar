export type AuditSuggestion = {
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  status: 'implemented' | 'scaffolded' | 'recommended';
  rationale: string;
  nextStep: string;
};

export const auditSuggestions: AuditSuggestion[] = [
  {
    priority: 'High',
    title: 'Keep the fuller App Router repository as the source of truth',
    status: 'implemented',
    rationale: 'It already includes the calculator, quiz, chatbot, lead finder, CRM, API routes, Prisma schema, seed data, compliance docs, tests and CI.',
    nextStep: 'Continue from this combined package in GitHub/Codex rather than restarting from the simpler Pages Router prototype.'
  },
  {
    priority: 'High',
    title: 'Use deterministic lead scoring with visible reasons',
    status: 'implemented',
    rationale: 'Operators need to understand why a lead is hot, research, nurture, or do-not-contact before outreach occurs.',
    nextStep: 'Score reasons are now exposed in social source cards, CRM cards and Intelligence Bank rows. Next: attach live intent-signal records to every saved source.'
  },
  {
    priority: 'High',
    title: 'Keep the chatbot as a state machine before adding open-ended AI',
    status: 'implemented',
    rationale: 'Button-led flows reduce PHI risk, support consistent positioning, and prevent the bot from acting like a therapy or clinical assistant.',
    nextStep: 'Add an admin-editable flow builder and optional knowledge-base answers only after prompt-injection and PHI safeguards are reviewed.'
  },
  {
    priority: 'High',
    title: 'Add production-grade public form protection',
    status: 'implemented',
    rationale: 'Calculator, quiz, and chatbot endpoints are public conversion surfaces and need abuse controls before launch.',
    nextStep: 'Rate limits, bot-trap checks, validation telemetry, request metadata and consent text versioning are now attached to public endpoints. Next: add external bot protection and alerting.'
  },
  {
    priority: 'High',
    title: 'Preserve human approval for outreach',
    status: 'implemented',
    rationale: 'Recovery Radar should draft and organize outreach, not auto-message contacts or bypass platform rules.',
    nextStep: 'Manual outreach approval queue is now available at /outreach-approval with Copy approved message instead of auto-send. Next: connect suppression list checks to every workflow.'
  },
  {
    priority: 'Medium',
    title: 'Adopt Shadcn UI gradually',
    status: 'recommended',
    rationale: 'Shadcn can improve accessible forms, tables, dialogs, and dashboard workflows without changing the product strategy.',
    nextStep: 'Initialize Shadcn after the first local install, then migrate high-touch components such as forms, tables, tabs, and dialogs.'
  },
  {
    priority: 'Medium',
    title: 'Add PDF/email report generation for calculator leads',
    status: 'implemented',
    rationale: 'The instant calculator creates interest; a polished report gives visitors a reason to opt in and schedule a walkthrough.',
    nextStep: 'Calculator now has downloadable printable report and copyable email report. Next: add true PDF rendering and automated email delivery after deliverability review.'
  },
  {
    priority: 'Medium',
    title: 'Add CRM import/export mappings',
    status: 'implemented',
    rationale: 'The growth workflow should eventually sync with HubSpot, Airtable, or another operating CRM without duplicate data entry.',
    nextStep: 'CRM import mapper is now available at /crm-import with CSV upload, field mapping, duplicate preview, suppression detection and score preview. Next: add saved mapping templates.'
  },
  {
    priority: 'Low',
    title: 'Use AI for content drafts and signal suggestions, not final decisions',
    status: 'implemented',
    rationale: 'AI can accelerate research and content, but compliance-sensitive decisions and outbound messages need human review.',
    nextStep: 'AI-generated content now returns approval metadata and the content generator captures human review status. Next: persist approvals to the database.'
  }
];
