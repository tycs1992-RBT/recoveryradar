# Recovery Radar / Infinite Suite OS

This repository is the original Recovery Radar project with the lean Infinite Suite OS offer incorporated directly into the main app. It is not a separate ZIP/build anymore.

## Product structure (naming model — locked, see docs/NAMING.md)

- **Infinite Pieces AI** = the company.
- **Infinite Suite OS™** = the ABA operational recovery product clinics license (where field staff work).
- **Recovery Radar™** = the **clinic owner's dashboard** — a CEO logs in and watches how well the Recovery Waterfall is recovering hours for their clinic.
- **Recovery Waterfall™** = the method/system that turns a cancellation into a recovered hour (cancel → Scheduler AI™ → auth check → SubPool™ → telehealth → makeup → admin).
- **Internal growth/lead suite** = the founder's private workspace (lead, SEO, CRM, outreach, intel). Secret, internal-only — *not* branded publicly. (This was previously, loosely, called "Recovery Radar"; that name now belongs to the owner dashboard.)

Three audiences, three logins, one public site:

- **Founder** (you) → the private growth/lead workspace (`/dashboard`).
- **Field staff** (RBTs, BCBAs) → Infinite Suite OS (mounted at `/provider-portal`).
- **Clinic owners / CEOs** → Recovery Radar (`/recovery-radar`).

Primary market line:

> Competitors manage the record. Infinite recovers the hour.

Primary product position:

> Keep your current EMR. Add Infinite Suite OS™ beside it.

## What public visitors see

The public site is designed for `https://www.infinitepieces.ai`:

- `/` — public homepage with no-migration positioning and Founding Clinic pricing.
- `/calculator` — Lost Hours Calculator using clinic-level estimates only.
- `/quiz` — ABA Operations Stack Quiz.
- `/provider-portal` — Provider Portal tour: the Infinite Suite OS™ mock OS (sample data, no PHI).
- Public Recovery Advisor chatbot on the homepage.

Public visitors do **not** see any of the three private workspaces unless they sign in.

## What the private team sees after login

The private workspace is protected by NextAuth:

- `/dashboard`
- `/lead-machine` — business lead list builder using Google Places for names, phones, websites, addresses and CSV export
- `/lead-finder` — public buyer-intent signal crawler using SerpApi when configured
- `/keyword-radar` — keyword research, page building, SERP checks and SEO planning
- `/seo-command-center` — full SEO growth suite direct route
- `/crm`
- `/tasks`
- `/outreach`
- `/content-generator`
- `/campaign-planner`
- `/analytics`
- `/settings`

Private APIs for leads, outreach tasks, intent finder, exports, analytics, content generation and lead scoring are also protected.

## Pricing model

Do not charge per staff user.

Use:

- Per active learner
- Unlimited staff seats
- Unlimited caregiver seats

### Design Partner Beta

- 1–2 clinics only
- 90 days free
- structured feedback required
- monthly recovered-hour scorecard required
- permission to use anonymized outcomes if successful

### Founding Clinic Trial

- $15 per active learner/month
- $500/month minimum
- unlimited staff seats
- unlimited caregiver seats
- no implementation fee for founding cohort
- 3-month pilot
- recovered-hour scorecard included

### Standard Phase 1

- $20 per active learner/month
- $750/month minimum
- unlimited staff seats
- unlimited caregiver seats
- optional implementation fee later

## Clean-slate data policy

This build is configured to avoid fake production data:

- no fictional leads
- no fake tasks
- no fake analytics
- no mock CRM pipeline rows

If an API key is missing, the app should return a clean warning or empty state instead of fictional leads.

## Local setup

```bash
cp .env.example .env
npm install --legacy-peer-deps --no-audit --no-fund
npm run dev
```

For full database-backed CRM/task storage, start Postgres first:

```bash
docker compose up -d
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## Production setup

The live stack should be:

- GitHub main branch
- Vercel hosting
- Neon/Postgres database
- Cloudflare DNS for `www.infinitepieces.ai`

Required live environment variables belong in Vercel, not only in local `.env`.

## Login

Default local workspace login:

```txt
Email: founders@infinitepieces.ai
Password: infinitemark2026
```

Change these in Vercel before treating the workspace as production secure.

## Lead and keyword machine keys

```env
GOOGLE_PLACES_API_KEY="your-places-key"
SERPAPI_API_KEY="your-serpapi-key"
OPENAI_API_KEY="your-openai-key"
HUBSPOT_PRIVATE_APP_TOKEN="your-hubspot-private-app-token"
RESEND_API_KEY="your-resend-api-key"
```

Google Custom Search is optional fallback only:

```env
GOOGLE_SEARCH_API_KEY="optional-custom-search-key"
GOOGLE_SEARCH_CX="optional-programmable-search-engine-id"
```

## Compliance behavior

The public calculator, quiz and chatbot should not collect PHI. Use clinic-level counts, rates and workflow descriptions only.

Use language like:

- privacy-aware
- HIPAA-conscious
- role-based access
- consent-aware workflows
- audit-readiness

Do not say:

- guaranteed HIPAA compliant
- guaranteed payer approved
- guaranteed billing compliant

The Recovery Advisor can answer general ABA operations, cancellation/callout recovery, caregiver communication, documentation readiness, field-average and Infinite Suite OS workflow questions. It should not collect PHI, provide patient-specific clinical advice, replace a BCBA, or make legal/compliance guarantees.

## Strategic docs

- `docs/PRICING_AND_OFFER.md`
- `docs/GROWTH_MACHINE_30_DAY_PLAN.md`
- `docs/COMPLIANCE_GUARDRAILS.md`
- `docs/PRODUCT_READINESS_AUDIT.md`
- `docs/MARK_PROPOSAL.md`
- `docs/DANIEL_PROPOSAL.md`
- `docs/FINAL_STRATEGY.md`
