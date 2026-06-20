# Recovery Radar™ Audit Suggestions and Merge Notes

This package is the best combined version of the fuller App Router MVP plus the audit-oriented starter. The smaller uploaded starter was useful as an architecture audit, but the fuller implementation remains the base because it already includes the dashboard, conversion routes, API routes, tests, seed data, docs, widget embed script, and Prisma/Auth scaffolding.

## Adopted into this combined version

### 1. Keep the App Router codebase

Use the Next.js App Router structure under `src/app`. The uploaded starter used the legacy `pages/` router, which is simpler but less aligned with the requested production-ready Next.js 15 architecture.

### 2. Add Shadcn-compatible scaffolding

Added `components.json` and reusable UI primitives under `src/components/ui/`:

- `button.tsx`
- `card.tsx`
- `input.tsx`
- `label.tsx`

These are Shadcn-style primitives that can be expanded later with the official CLI. The existing custom UI remains intact so the MVP does not need a broad refactor before launch.

### 3. Strengthen Prisma/Supabase readiness

The schema now includes `directUrl = env("DIRECT_URL")`, which is helpful for Supabase and pooled Postgres setups. The `.env.example` includes a local `DIRECT_URL` fallback.

The schema also includes a `SuppressionListEntry` model so production email outreach can respect opt-outs and maintain a global suppression list.

### 4. Preserve and extend lead scoring

The original `scoreLead()` engine is still the canonical scoring function because it returns score, tier, and reason details. Added audit-style adapters:

- `scoreLeadFromRecords(lead, signals)`
- `calculateLeadScore(lead, signals)`

These support the Prisma-shaped function signature from the audit snippet while preserving the richer score explanation used by the dashboard.

### 5. Preserve the state-machine chatbot

The bot remains a controlled state machine, not an open-ended therapy assistant. This is intentional for privacy and compliance. It routes visitors through known options, repeats no-PHI reminders, and captures only minimal opt-in contact details.

### 6. Add compliance utility checks

Added `src/lib/compliance.ts` with:

- privacy notice
- estimate notice
- CAN-SPAM checklist
- HIPAA-conscious messaging guidance
- outreach draft validation helpers

Also added tests for compliance template checks.

### 7. Add literal route aliases

The original app uses short public routes like `/calculator` and `/quiz`. The combined version also includes route aliases that match the product spec labels:

- `/lost-hours-calculator`
- `/aba-operations-stack-quiz`
- `/recovery-advisor-chatbot`
- `/outreach-templates`

### 8. Add API convenience routes

Added lightweight API routes for:

- `GET /api/analytics`
- `POST /api/lead-score`
- `GET /api/outreach/templates`

These make it easier for Codex or another engineer to wire UI cards and external integrations without changing core logic.

## Potential suggestions for the next engineering pass

### Shadcn UI full migration

The app is now Shadcn-ready, but not fully migrated. A future pass can run the official Shadcn CLI and gradually replace custom `card`, `input`, `badge`, and button classes with standardized components.

Recommended approach: migrate page by page rather than replacing all styles at once.

### Real authentication provider

The MVP uses a demo credential provider. Before production, replace it with a real auth provider and persist user roles in the database.

Suggested roles:

- Admin
- Growth
- Viewer

### Manual outreach approval queue

The schema and copy assume manual outreach approval. A production pass should create an explicit queue for draft generation, approval, send status, opt-out enforcement, and audit logs.

### Suppression list enforcement

The schema now contains `SuppressionListEntry`. The next pass should check this table before any email task can be approved or sent.

### Rate limiting and bot protection

Add rate limiting to public calculator, quiz, chatbot, and lead capture routes before running ads.

### Intent Finder hardening

The Intent Finder should use official APIs and public-source pages only. A future pass should add:

- source allowlist/denylist
- robots/platform-rule review notes
- deduplication confidence score
- fuzzy company matching
- extraction confidence levels

### Analytics persistence

The analytics page currently uses mock metrics and seeded events. Production should log events for:

- page views
- calculator starts/completions
- quiz completions
- chatbot path selection
- provider portal clicks
- lead capture consent
- demo requests

### Delivery and compliance configuration

Before email sending, configure:

- verified sending domain
- SPF, DKIM, and DMARC
- physical address merge field
- unsubscribe link
- suppression list
- manual approval review
- audit events for all sends and opt-outs

## Recommended development sequence

1. Run install, typecheck, tests, and build.
2. Connect Supabase/Postgres and run Prisma push or migrations.
3. Replace demo auth.
4. Wire public lead capture fully into CRM views.
5. Add rate limiting and bot protection.
6. Add manual outreach approval and suppression enforcement.
7. Connect analytics.
8. Launch limited traffic to the calculator and quiz.
