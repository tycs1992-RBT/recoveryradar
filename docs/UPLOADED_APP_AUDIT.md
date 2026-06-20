# Audit of Uploaded `recovery-radar-app.zip`

The uploaded package is a useful prototype, but it should not replace the fuller Recovery Radar™ repository.

## What was useful

- Clear simplified Prisma model names.
- Straightforward calculator UI that made the formulas easy to inspect.
- Simple CRM table that showed status-update intent.
- Lightweight pages for dashboard, leads, calculator, quiz, chatbot, CRM, analytics, and settings.

## What was weaker than the fuller app

| Area | Uploaded package | Combined app decision |
|---|---|---|
| Routing | Pages Router | Keep App Router for modern Next.js structure |
| Auth | Dependency listed, not wired deeply | Keep NextAuth demo provider + RBAC scaffold |
| Calculator | Percent labels were ambiguous because inputs used 0–1 ranges | Use 0–100 percentage inputs with Zod validation |
| Chatbot | Echo-style placeholder | Use deterministic state-machine flows |
| Schema | Good simplified schema, but fewer models | Keep fuller schema with auth, campaigns, analytics, audit events |
| API routes | Minimal / absent | Keep calculator, quiz, chat, content, intent finder, leads, CSV export |
| Compliance | Mentioned, but lighter | Keep dedicated compliance docs and no-PHI UI copy |
| Testing | None included | Keep Vitest unit tests |
| CI | None included | Keep GitHub Actions CI |

## How uploaded ideas were folded into the combined package

- The simplified schema was preserved as guidance in `docs/AUDIT_SUGGESTIONS.md`, but the richer Prisma schema remains active.
- The calculator’s readability informed the audit notes; the production source of truth remains `src/lib/calculator.ts` plus `src/components/calculator/LostHoursCalculator.tsx`.
- The CRM table idea is represented in the existing CRM/Lead Finder workspace, but the combined app keeps stronger scoring and status views.
- The bot concept is implemented as a privacy-aware, button-first state machine instead of a freeform echo assistant.

## Recommendation

Use the combined App Router package for development. Treat the uploaded Pages Router package as an early prototype reference only.
