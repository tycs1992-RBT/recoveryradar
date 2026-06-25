# GitHub / Codex Handoff Prompt

Use this prompt after uploading this repository to GitHub or opening it with Codex:

```text
You are working in the Recovery Radar™ repository for Infinite Pieces AI.

Goal: turn the existing starter into a deployable MVP.

Constraints:
- Preserve the core message: “Keep your current EMR. Add Infinite Suite beside it. Recover lost hours.”
- Do not position Infinite Suite OS™ as an EMR replacement.
- Public calculator, quiz and chatbot must not ask for PHI.
- Outreach must remain manual approval only.
- Use public-source lead research only. Do not scrape private communities or bypass platform rules.

Audit-merge notes:
- This is the best combined App Router version, not the smaller pages-router starter.
- Preserve the Shadcn-compatible components and `components.json`; migrate styles gradually.
- Keep `scoreLead()` as canonical and use `scoreLeadFromRecords()` / `calculateLeadScore()` for Prisma-shaped inputs.
- Enforce the `SuppressionListEntry` table before production email sending.

Immediate tasks:
1. Run npm install, npm run db:generate, npm run typecheck, npm test and npm run build.
2. Fix any dependency or type errors created by the local environment.
3. Connect Supabase/Postgres using DATABASE_URL.
4. Run npm run db:push and npm run db:seed.
5. Deploy to Vercel with all environment variables from .env.example.
6. Replace demo credential auth with the production auth provider.
7. Add manual approval queue persistence for outreach drafts.
8. Add production analytics event ingestion.
9. Wire calculator/quiz/landing-page lead capture forms to API routes.
10. Add rate limiting and bot protection to public routes.
11. Wire the suppression list into outreach approval.
12. Convert public forms to persist analytics events.
```
