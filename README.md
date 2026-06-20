# Recovery Radar / Infinite Suite OS Demo

This is the combined public demo + private lead workspace for Infinite Pieces AI.

## What public visitors see

The public sees the Infinite Suite OS public demo flow:

- `/` — branded public homepage with current Infinite Pieces AI visuals.
- `/calculator` — Lost Hours Calculator.
- `/quiz` — ABA Operations Stack Quiz.
- `/provider-portal` — Provider Portal mock OS wrapper with a back button to the public demo.
- Public Recovery Advisor chatbot on the homepage.

Public visitors do **not** see the private Recovery Radar workspace unless they sign in.

## What you and Mark see after login

The private workspace is protected by NextAuth:

- `/dashboard`
- `/lead-machine` — business lead list builder for names, phones, websites, addresses, CSV export and HubSpot sync
- `/lead-finder` — public buyer-intent signal crawler
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

If Docker is not working, skip `db:push` and `db:seed` and run `npm run dev`; many pages will still work with mock/demo data.

## Login

Default local demo login:

```txt
Email: founders@infinitepieces.ai
Password: infinitemark2026
```

Change these in `.env` before deploying.


## Lead and keyword machine

The latest build includes the practical lead spreadsheet and SEO machine:

- `/lead-machine` finds businesses with Google Places and exports CSVs.
- `/keyword-radar` and `/seo-command-center` import Google Keyword Planner CSVs, score keywords, build SEO page briefs, map keywords to URLs, generate a 30-day content calendar, create local SEO page ideas, check SERPs, audit websites, and import Search Console CSVs.

Useful optional keys:

```env
GOOGLE_PLACES_API_KEY="your-places-key"
GOOGLE_SEARCH_API_KEY="your-custom-search-key"
GOOGLE_SEARCH_CX="your-programmable-search-engine-id"
HUBSPOT_PRIVATE_APP_TOKEN="your-hubspot-private-app-token"
RESEND_API_KEY="your-resend-api-key"
```

See `docs/SEO_GROWTH_SUITE.md` for the keyword workflow.

## Cloudflare setup

For demo.infinitepieces.ai, set:

```env
NEXTAUTH_URL="https://demo.infinitepieces.ai"
NEXT_PUBLIC_SITE_URL="https://demo.infinitepieces.ai"
NEXTAUTH_SECRET="a-long-random-secret"
DEMO_ADMIN_EMAIL="admin@infinitepieces.ai"
DEMO_ADMIN_PASSWORD="your-private-shared-password-for-you-and-mark"
```

You can put the whole app behind Cloudflare DNS/proxy. The public homepage, calculator, quiz, chatbot and provider portal stay public. The private workspace stays behind the app login. You can add Cloudflare Access later for a second security layer.

## Sign out

Inside the private workspace, expand the lower-left account panel and click **Sign out**. You can also visit `/api/auth/signout`.

## Chatbot behavior

The Recovery Advisor can answer general ABA operations, cancellation/callout recovery, caregiver communication, documentation readiness, field-average and Infinite Suite OS workflow questions. It should not collect PHI, provide patient-specific clinical advice, replace a BCBA, or make legal/compliance guarantees.
