# Recovery Radar™ × Infinite Suite OS™ — Integration Handoff

Recovery Radar™ (Next.js App Router shell) now hosts the Infinite Suite OS™ sandbox
as the **Provider Portal tour** at `/provider-portal`. The two previously-separate
apps are merged into one deployable project.

## 1. Summary of what changed
- **Shell = Recovery Radar.** The public website + private workspace are unchanged and
  remain the source of truth.
- **Sandbox mounted inside the shell.** The Infinite Suite OS™ Vite/React SPA is built to
  static assets and served at `/provider-os/`. The `/provider-portal` route wraps it in
  Recovery Radar chrome with the required **"Tour Mock OS — sample data only, no PHI"**
  banner and the recovery-walkthrough CTA buttons (Scheduler AI™ → API Hub™).
- **Old demos removed.** `public/current-demo/` and `public/infinitepieces-demo/`
  (the old demo.infinitepieces.ai static bundles, ~42 MB) were deleted.
- **Dead links repointed.** The nav "Original Demo" link and the homepage
  "Open original uploaded demo" button now point to `/provider-portal`
  (homepage CTA relabeled "Tour Provider Portal", per spec).
- **Repo de-junked.** The GitHub repo root carried 1,020+ duplicate re-upload files
  (`foo (1).tsx`, stray PNGs, dup configs). The merged project contains only the
  canonical Next app (27 root entries) + the mounted sandbox.
- `next.config.mjs`: moved `typedRoutes` out of `experimental` (clears a build warning).

## 2. Route map
Public (crawlable, in sitemap): `/`, `/calculator`, `/quiz`, `/topics`,
`/aba-keyword-bank`, `/provider-portal`, `/recovery-advisor-chatbot`, `/login`.
Provider Portal tour (public, sales walkthrough): `/provider-portal` → embeds `/provider-os/`.
Private workspace (login-gated via middleware, NOT in sitemap): `/dashboard`,
`/workflow-center`, `/lead-machine`, `/emr-shopping-radar`, `/executive-prospector`,
`/linkedin-prospector`, `/intelligence-bank`, `/keyword-radar`, `/seo-command-center`,
`/crm`, `/crm-import`, `/tasks`, `/outreach`, `/outreach-approval`, `/content-generator`,
`/campaign-planner`, `/analytics`, `/audit-suggestions`, `/settings`, `/bot-builder`.

## 3. Files changed
- `src/app/provider-portal/page.tsx` — rewritten to wrap the new sandbox + banner + CTAs.
- `src/components/layout/MarketingHeader.tsx` — removed dead "Original Demo" nav link.
- `src/app/page.tsx` — homepage CTA repointed to `/provider-portal`.
- `next.config.mjs` — `typedRoutes` relocated.
- `public/provider-os/**` — NEW: built Infinite Suite OS sandbox (mounted static).
- `public/current-demo/**`, `public/infinitepieces-demo/**` — DELETED.

## 4. Env vars (server-side only — see .env.example)
- `DATABASE_URL` — Postgres connection string (Prisma).
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL` — NextAuth.
- `OPENAI_API_KEY` (and any provider keys the workspace tools use) — optional; tools
  show a "missing API key" state without them.

## 5. Run commands
```
npm install
npx prisma generate        # downloads the Prisma engine; needs internet
npm run db:push            # apply schema to your DATABASE_URL (first run)
npm run db:seed            # optional demo data
npm run dev                # http://localhost:3000
npm run build && npm start # production
```

## 6. Known limitations
- **Provider Portal is an iframe-embedded SPA, not native RSC.** The sandbox's 9 modules
  remain a Vite/React app served statically and embedded — the reliable way to fit it
  "inside" the Next shell without rewriting every module. Module deep-link CTAs use
  `#/<module>` hashes; wire them to the sandbox router if not already handled there.
- To change the sandbox, edit it in its own project and rebuild (`npm run build`), then
  copy its `dist/` into `public/provider-os/`. (Its vite.config already uses `base: './'`
  for sub-path embedding.) A small build script can automate this.
- The Provider Portal is intentionally public (sales tour) and contains only de-identified
  sample data (Learner A, RBT 1, BCBA 1, Caregiver A). No PHI.

## 7. Testing checklist
- [ ] `/` loads; "Tour Provider Portal" + "Calculate lost hours" CTAs work
- [ ] `/calculator` and `/quiz` work
- [ ] `/provider-portal` shows the no-PHI banner and the embedded Infinite Suite OS
- [ ] Module CTA buttons load the sandbox in the embedded frame
- [ ] Visiting a workspace route while logged out redirects to `/login`
- [ ] `/sitemap.xml` lists public pages only (no workspace routes)
- [ ] `npm run build` completes after `prisma generate`

## Build status (verified in prep)
`npm install` ✓ (499 pkgs) · `next build` → **compiled successfully (32s)**.
Full build completion requires `prisma generate`, which needs network access to Prisma's
binary host — run it in your environment, then the build finishes.

## Update — module fixes (provider portal)
- **Rebuilt the embedded Infinite Suite OS from source.** The previously-shipped
  `dist/` was stale (built before icon imports like `Loader2` were added), which caused
  "Module unavailable — X is not defined" crashes. `public/provider-os/` now contains a
  fresh build where all 9 modules load.
- **Added the demo backend the sandbox calls.** Its modules POST to `/api/ai/text`,
  `/api/ai/json`, `/api/ai/core9-generate`, `/api/core9/handoff`, `/api/images/generate`,
  `/api/voice/tts`, `/api/audit/event`, `/api/health`, `/api/recovery/cancel`,
  `/api/session/:action`. These now exist as Next routes that return the sandbox server's
  DEMO_MODE responses — no API keys, no PHI, nothing persisted. Logic ported from the
  sandbox's `server/index.js`; shared in `src/lib/infinite-suite-demo.ts`.
  (This is why the terminal previously showed `POST /api/audit/event 404`.)
- To change the embedded OS later: edit it in the sandbox project, `npm run build`, and copy
  its `dist/` into `public/provider-os/` (then set the favicon href to `./favicon.svg`).
