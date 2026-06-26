# Work-Login Intel Suite — Audit & API Setup (Step 1)

Audited the actual API routes in `src/app/api/`. Good news: **the architecture for your whole vision already exists**, and most of the scanning routes are REAL (they call official APIs), not mock. They're in "clean-slate" mode — when an API key is missing they return an honest "not configured" notice instead of fake data. So the work is mostly: **add keys → they come alive**, then wire them into one workflow and sharpen the intelligence.

Legend: 🟢 real + needs only a key · 🟡 real but thin/needs work · 🔵 storage/CRM (needs DB) · ⚪ AI helper

---

## The intel/lead-gen tools you already have

### Scanning (find people + signals)
| Tool | Route | State | What it does | Needs |
|---|---|---|---|---|
| **EMR Shopping Radar** | `emr-shopping-radar` | 🟢 real | Searches public web for people shopping/complaining about EMRs; scores + can persist | `SERPAPI_API_KEY` *or* `GOOGLE_SEARCH_API_KEY`+`GOOGLE_SEARCH_CX`; `DATABASE_URL` to save |
| **Reddit Signals** | `reddit-signals` | 🟢 real | Searches Reddit (r/ABA etc.) for CentralReach/Rethink/Motivity complaints. OAuth + public-JSON fallback | `REDDIT_CLIENT_ID`+`REDDIT_CLIENT_SECRET`+`REDDIT_USER_AGENT` (works lightly without) |
| **Intent Finder** | `intent-finder` + `/crawl` | 🟢 real | Keyword → public buying-intent results, classified hot/warm/research with "why it matters" | Same search keys as above |
| **New-Clinic Finder** | `lead-machine/places` | 🟢 real | Google Places search for ABA clinics by type+location (your "clinics just opening up") | `GOOGLE_PLACES_API_KEY` |
| **LinkedIn Prospector** | `linkedin-prospector` | 🟢 real | Searches Google-indexed *public* LinkedIn results for execs/founders (search-based, NOT scraping) | `SERPAPI_API_KEY` |
| **Lead enrich** | `lead-machine/enrich` | 🟡 real | Enriches found leads (website/contact signals) | none flagged — verify |
| **Keyword Research / SEO** | `keyword-research`, `seo-suite`, `serp-checker` | 🟢/🟡 | Keyword + SERP intel for your own growth/SEO | search keys |
| **Website Audit** | `website-audit` | 🟢 real | Audits a prospect's site | none |

### Store + work the leads
| Tool | Route | State | Needs |
|---|---|---|---|
| **Intelligence Bank** (deduped leads) | `intelligence-bank` | 🔵 | DB |
| **Leads / Lead Score** | `leads`, `lead-score` | 🔵/⚪ | DB |
| **CRM Board + Import** | `CRMBoard.tsx`, `crm-import` | 🔵 | DB |
| **Outreach Workbench + Approval** | `outreach-tasks`, `outreach/templates` | 🔵 | DB |
| **HubSpot sync** | `hubspot/sync-lead` | 🟢 real | `HUBSPOT_PRIVATE_APP_TOKEN` |
| **Content / Campaign generators** | `content`, `campaign-image-prompts` | ⚪ AI | `OPENAI_API_KEY` |

---

## The honest line on data sources (READ THIS)

**Safe + powerful (what your code already does):** search-and-surface via OFFICIAL APIs — Reddit API, Google Custom Search / SERP, Google Places. These find *public* posts/businesses and hand you URLs to engage with manually. This is normal, legal market research + lead discovery.

**The danger zone — automated scraping of Instagram / Facebook / LinkedIn profiles:**
- Violates those platforms' Terms of Service. They actively block it and **ban accounts**.
- Meta and LinkedIn have **litigated** against scrapers.
- Compiling personal profiles into a marketing DB also implicates **CCPA/GDPR** (privacy) and **CAN-SPAM** (outreach).
- The "Facebook scan mode" in your git history is the kind of thing that can get the tool — and your business accounts — banned.

**The fix is a mindset, not a feature cut:** *surface-for-manual-engagement = fine; automated-harvest-into-database = not fine.*
- "Find Instagram links of new clinics" → use **Places** to find the clinics + **search** to surface their *public* social links → YOU click through and engage like a human. ✅
- Bulk-pulling follower lists / DMing at scale / scraping profile fields into a CRM. ❌

You get ~90% of the value on the safe side. Everything below is built on the safe side.

---

## YOUR PART — API keys to get (in priority order)

Add these in **Vercel → Project → Settings → Environment Variables** (and your local `.env` for testing). Each unlocks the tool next to it.

1. **SERP API** (`SERPAPI_API_KEY`) — unlocks EMR Shopping Radar, Intent Finder, LinkedIn Prospector, SERP checker. **Highest leverage — one key lights up 4 tools.**
   - Get at: serpapi.com → free tier ~100 searches/mo to test, paid for volume.
   - *Alternative:* Google Custom Search (`GOOGLE_SEARCH_API_KEY` + `GOOGLE_SEARCH_CX`) — cheaper but 100 queries/day cap and you must create a Custom Search Engine. SERP API is simpler; set one and the routes use it.

2. **Google Places** (`GOOGLE_PLACES_API_KEY`) — unlocks the new-clinic finder.
   - Get at: Google Cloud Console → enable "Places API" → create key. Has a monthly free credit.

3. **Reddit** (`REDDIT_CLIENT_ID` + `REDDIT_CLIENT_SECRET` + `REDDIT_USER_AGENT`) — makes the Reddit scanner robust (works lightly without, but rate-limited).
   - Get at: reddit.com/prefs/apps → create a "script" app. User-agent = something like `infinite-pieces-intel/1.0 by u/yourname`.

4. **DATABASE_URL** (Postgres) — required to *save* leads (Intelligence Bank, CRM, outreach). Without it, scans work but results don't persist.
   - You likely already have this (Vercel Postgres / Supabase / Neon). It was in your `.env`.

5. *(Optional, later)* **HubSpot** (`HUBSPOT_PRIVATE_APP_TOKEN`) if you push leads to HubSpot; **OPENAI_API_KEY** for the AI content/outreach drafting.

**Minimum to make the intel suite real today: #1 (SERP) + #2 (Places) + #4 (DB).** Those three unlock scan → score → save.

---

## Build plan (Steps 2–4, after keys)
- **Step 2:** harden the Reddit/EMR-complaint scanner — robust queries, dedup, transparent scoring.
- **Step 3:** the new-ABA-clinic finder via Places — clean UI, surfaces public website/social links for manual engagement.
- **Step 4:** wire the pipeline — scan → score → Intelligence Bank (deduped) → CRM → outreach queue — so it's one flow, not separate tools.

Each step: I build + typecheck (compiles verified here); **you/Daniel test live with real keys** (the sandbox can't make external API calls).
