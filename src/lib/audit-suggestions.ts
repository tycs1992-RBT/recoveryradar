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
    nextStep: 'Expose score modifiers on the lead detail page and re-score whenever new intent signals are attached.'
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
    status: 'recommended',
    rationale: 'Calculator, quiz, and chatbot endpoints will be public conversion surfaces and need abuse controls before launch.',
    nextStep: 'Add rate limits, bot protection, validation error monitoring, and consent text versioning to public API routes.'
  },
  {
    priority: 'High',
    title: 'Preserve human approval for outreach',
    status: 'scaffolded',
    rationale: 'Recovery Radar should draft and organize outreach, not auto-message contacts or bypass platform rules.',
    nextStep: 'Create a manual approval queue for email/LinkedIn drafts and globally suppress do-not-contact leads.'
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
    status: 'recommended',
    rationale: 'The instant calculator creates interest; a polished report gives visitors a reason to opt in and schedule a walkthrough.',
    nextStep: 'Create a report renderer that includes assumptions, results, recommended modules, no-PHI disclaimer, and CTA.'
  },
  {
    priority: 'Medium',
    title: 'Add CRM import/export mappings',
    status: 'scaffolded',
    rationale: 'The growth workflow should eventually sync with HubSpot, Airtable, or another operating CRM without duplicate data entry.',
    nextStep: 'Extend CSV export and add import validation, dedupe, and field mapping screens.'
  },
  {
    priority: 'Low',
    title: 'Use AI for content drafts and signal suggestions, not final decisions',
    status: 'scaffolded',
    rationale: 'AI can accelerate research and content, but compliance-sensitive decisions and outbound messages need human review.',
    nextStep: 'Add approval metadata to AI-generated content and score/signal recommendations.'
  }
];
