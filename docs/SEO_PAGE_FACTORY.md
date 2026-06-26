# SEO Page Factory — how to use it

The factory turns a keyword into a complete, compliance-safe ABA landing page that you can
publish to the public site. It lives in the workspace at **/seo-page-factory** (nav label
"SEO Page Factory", eyebrow "Publish pages").

## The workflow (what happens, in order)

1. **Pick a keyword** — tap a seed (e.g. "CentralReach alternative") or type your own.
2. **Generate page draft** — builds H1, intro, sections, FAQs, schema JSON-LD, internal
   links, CTAs, and social/email/Google-Ads copy. No AI key needed — it's deterministic.
3. **Review** the draft in the preview panel.
4. **Save draft** — adds it to the Page Library. (In local dev this writes
   `data/seo-pages.json`.)
5. **Approve** — stamps who approved it.
6. **Publish** — marks it PUBLISHED.
7. **Commit + push** `data/seo-pages.json` — this is the step that makes it live, because
   the site reads pages from that committed file:
   ```
   git add data/seo-pages.json
   git commit -m "Publish SEO page: <keyword>"
   git push origin main
   ```
8. **Submit the URL in Google Search Console** — the publish action gives you the exact URL
   (`https://www.infinitepieces.ai/topics/<slug>`). Use the "Copy Search Console URLs" button.

## Where pages go live

- Public page: **/topics/[slug]** (only when status is PUBLISHED).
- Listed on the public **/topics** index, grouped by category.
- Added automatically to **/sitemap.xml**.
- Draft/approved pages can be previewed at `/topics/[slug]?preview=1` — these are **noindex**
  and won't appear publicly or in the sitemap.

## Why the commit step?

Vercel's serverless filesystem is read-only at runtime, so "publish" can't persist by writing
a file in production. Instead, you author + publish locally, and the committed JSON is the
source of truth — which fits your localhost → push → Vercel-deploy flow exactly. (When you're
ready for publish-direct-from-production, the data model already matches a Prisma
`SeoLandingPage` table; swapping `seo-page-store.ts` to Prisma is a drop-in.)

## Guardrails (built into every generated page)

- No PHI; no HIPAA / payer-approval / billing-correctness guarantees.
- "Supports compliance workflows", never "guarantees compliance".
- No AI-therapist / AI-BCBA claims; human review required before publish.
- Positioning is always: **keep your current EMR, add Infinite Suite OS™ beside it as an
  operational recovery layer** — never "full EMR replacement", never direct competitor attacks,
  no fabricated statistics.

## APIs (all workspace-auth protected except public reads)

- `POST /api/seo-pages/generate` — build a draft
- `GET/POST /api/seo-pages` — list / save
- `PATCH /api/seo-pages/[id]` — update
- `POST /api/seo-pages/[id]/approve | /publish | /archive`
- `GET /api/seo-pages/by-slug/[slug]` — public; returns PUBLISHED only

## Analytics

The factory fires workspace events (`seo_page_generated`, `seo_page_approve`,
`seo_page_publish`, `seo_page_archive`) to `/api/analytics`, so you can see activity in the
Analytics view.
