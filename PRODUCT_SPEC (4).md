# Recovery Radar MVP Roadmap

## Phase 1 — Foundations

- Configure Next.js, TypeScript, Tailwind, Prisma and Postgres.
- Add auth and workspace layout.
- Create schema and seed data.

## Phase 2 — Intent Finder and Scoring

- Seed keyword groups.
- Add public-source search API scaffold.
- Implement 0–100 scoring engine.
- Add Lead Finder page and CSV export.

## Phase 3 — Calculator and Quiz

- Build Lost Hours Calculator.
- Save calculator results and consent records.
- Build ABA Operations Stack Quiz.
- Save persona segmentation and module path.

## Phase 4 — Website Bot

- Add Recovery Advisor widget.
- Add iframe embed route and public embed script.
- Store chat events and lead captures.

## Phase 5 — CRM and Outreach

- Add pipeline board.
- Add template library and merge fields.
- Add manual approval queue before sending.

## Phase 6 — Content and Analytics

- Add AI-assisted content drafts.
- Track calculator, quiz, portal and demo events.
- Prepare launch dashboard.

## Phase 7 — Beta and Feedback

- Invite founding clinics.
- Collect structured feedback.
- Refine scoring, copy and recovery metrics.

## Audit-based backlog additions

- Add shadcn/ui after the MVP UI stabilizes.
- Keep the public chatbot deterministic and state-machine based; use AI only server-side with human review.
- Add score history, score versioning and scheduled re-scoring.
- Add consent source metadata and retention policy fields.
- Add opt-out suppression and approval metadata before enabling any email provider.
- Add rate limits, bot protection, E2E tests and a security review before public launch.
