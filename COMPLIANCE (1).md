# Recovery Radar Architecture

## Product thesis

Recovery Radar captures high-intent ABA software demand and reframes it around operational recovery: clinics may not need to migrate away from their current EMR; they may need a workflow layer that recovers authorized hours from cancellations, callouts, caregiver communication gaps and documentation cleanup.

## Subsystems

1. EMR Buyer Intent Finder — public-source search, signal extraction, fuzzy deduplication and ethical lead ingestion.
2. Lost Hours Calculator — public conversion tool with immediate estimates and optional consent-based report capture.
3. ABA Operations Stack Quiz — visitor segmentation and module recommendations.
4. Website Conversion Bot — no-PHI informational assistant that routes visitors to calculator, quiz, demo and lead capture.
5. Lead Scoring & CRM Dashboard — internal pipeline, outreach tasks, templates, audit events and analytics.

## Data flow

Public source or visitor action → lead/signal/calculator/quiz/chat record → score or segment → CRM status → manual outreach approval → demo/beta follow-up.

## Security posture

- No PHI collection in public forms.
- Role-based access for internal workspace.
- Server-side API calls for search and AI generation.
- Postgres persistence through Prisma.
- Consent records for opted-in contacts.
- Audit events for sensitive changes.

## Deployment target

- Vercel for Next.js.
- Supabase or hosted Postgres for database.
- Optional Google Custom Search for public-source intent discovery.
- Optional OpenAI for content drafts and future AI-assisted workflow recommendations.
- Email provider added only after compliance review and manual-approval queue.
