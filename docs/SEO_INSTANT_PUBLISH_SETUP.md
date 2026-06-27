# Instant-publish for SEO pages — setup (5 minutes, one time)

## What changed
The SEO Page Factory now persists pages in a datastore instead of a file that only
updates on deploy. Once a datastore is connected, **clicking Publish in the founder
portal makes the page live immediately** at `/topics/<slug>` — no commit, no redeploy.

If NO datastore is connected, the system safely falls back to the committed
`data/seo-pages.json` (exactly the old behavior), so nothing breaks before setup.

## One-time setup on Vercel
1. Vercel dashboard → your **recoveryradar** project → **Storage** tab.
2. **Connect Database → Marketplace → Upstash (Redis)**. Let Vercel manage the Upstash
   account (simplest), choose a name + region near your users, Free plan.
3. Vercel auto-injects two env vars into the project: `KV_REST_API_URL` and
   `KV_REST_API_TOKEN`. (The code also accepts `UPSTASH_REDIS_REST_URL` /
   `UPSTASH_REDIS_REST_TOKEN` if you ever set it up directly at upstash.com.)
4. **Redeploy** once so the running app picks up the new env vars.

That's it. The first time the app reads pages, it seeds the datastore once from the
committed `data/seo-pages.json` (so your existing CentralReach page carries over).
Everything you publish after that lives in the datastore and is live on click.

## Local dev
- No env vars set locally → it reads/writes `data/seo-pages.json` like before.
- Want to test live-publish locally → run `vercel env pull .env.local` to pull the
  Upstash vars down, then `npm run dev`.

## How "live on click" works
Publish/edit/archive call Next.js `revalidatePath()` for `/topics/<slug>`, `/topics`,
and the sitemap, so the page, the topic index, and `sitemap.xml` update at once.
New slugs render on first request (dynamicParams), so a brand-new page is reachable
immediately.

## After publishing a page (for ranking, not just "live")
1. Confirm it loads: `https://www.infinitepieces.ai/topics/<slug>`.
2. Google Search Console → URL Inspection → paste the URL → **Request indexing**.
3. The page is already in `https://www.infinitepieces.ai/sitemap.xml` and linked from
   `/topics`, which is how Google discovers the rest over time.
