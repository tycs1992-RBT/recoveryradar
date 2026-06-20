# Recovery Radar™ Final Master Build

This master build combines the best uploaded Recovery Radar package with the latest project work completed in ChatGPT.

## Added in this final build

### EMR Buyer Intent Crawler
- New route: `src/app/api/intent-finder/crawl/route.ts`.
- Uses keyword groups from Postgres/Prisma when available and static keyword groups as fallback.
- Supports Google Custom Search via `GOOGLE_SEARCH_API_KEY` and `GOOGLE_SEARCH_CX`.
- Returns public-source results only for manual review.
- Infers signals such as `new_clinic`, `hiring_scheduler`, `hiring_bcba`, `emr_shopping`, and `operations_pain`.
- Does not scrape private groups, does not collect hidden emails, and does not auto-message anyone.

### CRM Dashboard UI
- Lead cards show score tier: Hot, Research, or Low.
- Cards include visual tier striping for quick pipeline scanning.
- CRM has per-lead task type selector.
- CRM has per-lead due-date picker.
- CRM can create outreach tasks using `/api/outreach-tasks`.
- CRM can hand off directly to the Outreach Workbench using `/outreach?leadId=<id>`.
- CRM includes notification banner and quick link to the task inbox.

### Outreach Task Management
- New route: `src/app/api/outreach-tasks/route.ts`.
- Supports `GET`, `POST`, and `PATCH`.
- Creates tasks for connection notes, InMail, email follow-up, and calls.
- Supports due dates, statuses, assigned owner, generated message, and template references.
- Falls back to mock mode when `DATABASE_URL` is not configured.

### Full Task Inbox
- New page: `/tasks`.
- New component: `src/components/tasks/TaskInbox.tsx`.
- Shows Pending, Approved, Due Today, and Overdue metrics.
- Includes filters: all, due today, overdue, upcoming, pending, approved, completed.
- Includes date editing, status editing, approve-draft action, and outreach handoff.
- Includes notification banner for task actions.

### Outreach Workbench
- Reads `leadId` from URL to pre-select CRM lead.
- Adds due-date picker for approval tasks.
- Creates approval tasks from drafted outreach.
- Copies draft text to clipboard.
- Links to the full Task Inbox.

## Local setup

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Optional search configuration

Add these to `.env` to enable live public search results:

```bash
GOOGLE_SEARCH_API_KEY=your_key
GOOGLE_SEARCH_CX=your_custom_search_engine_id
```

Without these values, the intent crawler returns safe mock results.

## GitHub repo

Target repository: `tycs1992-RBT/recoveryradar`.

The repo has been initialized with a README and handoff issue. Unzip this master build into the repository root and commit the files.

## Compliance posture

Recovery Radar™ is intentionally designed as a no-PHI, public-source, manual-review growth workspace. It supports HIPAA-conscious and privacy-aware workflows but does not claim blanket HIPAA compliance. Outreach requires human review, truthful sender identity, opt-out language, and no deceptive personalization.

## Infinite Pieces demo merge

This final build now includes the uploaded `infinitepieces-demo` HTML site inside `public/current-demo`. The current landing page assets are copied into `public/brand-assets` and used on the new Recovery Radar homepage so the app visually matches the current `demo.infinitepieces.ai` experience.

New routes:

- `/` — branded Recovery Radar + Infinite Suite OS™ homepage using current demo imagery.
- `/provider-portal` — iframe wrapper that opens the uploaded Provider Portal mock OS at `/current-demo/index.html#provider-portal`.
- `/current-demo/index.html` — preserved original uploaded HTML demo for reference and full-page access.

The sidebar signed-in box has also been changed into a collapsible/hideable account card so it no longer blocks navigation items at the bottom-left of the workspace.
