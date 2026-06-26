# Daniel Handoff — Recovery Radar™ × Infinite Suite OS™ (current, authoritative)

This is the single source of truth for the handoff. It supersedes older handoff docs.
Read this first; the others are background.

---

## 1. The whole system in one picture

**Three audiences, three logins, one public site (this repo).**

| Audience | Where they log in | What they do | Data direction |
|---|---|---|---|
| **Founder** (Tyler) | `/dashboard` (founder workspace) | Market the brand, find clinics to sell to (lead-gen, SEO, CRM, outreach, intel) | Outward — scans the market |
| **Field staff** (RBT/BCBA) | `/provider-portal` → **Infinite Suite OS** | Run the day: sessions, cancellations, SubPool, recovery on the floor | **Generates** recovery events |
| **Clinic owners / CEOs** | `/recovery-radar` → **Recovery Radar** | Watch the motherboard: recovery rate, hours/$ recovered, where it wins/slips | **Displays** recovery events |

**The one connection that ties it together:**

> Field staff act in **Infinite Suite OS** → those actions become **recovery events** in the
> backend → **Recovery Radar** reads them, scoped by `tenantId`, and shows the owner.

Infinite Suite OS and Recovery Radar are two ends of one pipe. Building that pipe is the core
backend job.

## 2. The two repos

- **Repo A — this one (`recoveryradar`, Next.js App Router):** the public marketing site, the
  founder workspace, the **Recovery Radar owner workspace** (built, demo data), and the
  Provider Portal that hosts Infinite Suite OS.
- **Repo B — the Infinite Suite OS sandbox (`core8-project`, Vite + React):** the operational
  product the field staff use.

**Current integration state:** Repo B is **already mounted** in Repo A — built to static assets
in `public/provider-os/` and embedded via an `<iframe>` at `/provider-portal` as a **tour**
(sample data, no PHI). So the embedding mechanism already exists.

**Daniel's integration decision:** turn that static tour into the **live** field-staff product.
Two viable paths:
- **Keep the iframe** and pass auth/session + data in/out via `postMessage` or a shared
  same-origin cookie. Fastest; keeps the sandbox as-is.
- **Port the sandbox into Next.js** components/routes. More work up front; gives one auth, one
  data layer, one deploy, no iframe boundary. (Tyler's lean, tradeoffs his call.)
Either way, the goal is the same: field-staff actions write real recovery events.

## 3. What's DONE (Tyler can demo it today)

- **Public marketing site** — pricing (Founding Pilot hero + tiers), Lost Hours Calculator,
  quiz, SEO landing pages + the **SEO Page Factory** (`/seo-page-factory`).
- **Founder workspace** — lead-gen/intel suite (EMR Shopping Radar, Executive Prospector,
  Intelligence Bank, CRM, outreach). Search now uses Google Custom Search first, SerpApi fallback.
- **Recovery Radar owner workspace** — `/recovery-radar` (overview), `/learners`, `/waterfall`,
  `/alerts`. Separate shell, role-guarded, middleware-protected. **De-identified demo data.**
- **Three logins wired**, role-separated. Naming model locked (docs/NAMING.md).
- Repo typechecks clean (`npx tsc --noEmit` → 0 errors).

## 4. What Daniel BUILDS (the real work — his domain)

1. **Multi-tenant data model + isolation (P0).** Every clinic is a tenant. Field staff and
   owners belong to a tenant. Every query filters by the authenticated user's `tenantId`. No
   cross-tenant read is ever possible. Add tests proving clinic A can't see clinic B.
2. **The recovery-event pipeline.** Infinite Suite OS actions (cancel, callout, makeup,
   telehealth, SubPool claim, recovery complete) → persisted recovery events → aggregated into
   the per-tenant metrics Recovery Radar reads.
3. **Wire Recovery Radar to real data.** Replace `src/lib/owner-demo-data.ts`'s lookup with a
   real per-tenant query that returns the **same `OwnerRadarData` shape** (that shape is the
   contract — don't change it, just fill it).
4. **Unify auth into one system, three roles** (founder / field-staff / owner). The seams are in
   place: `src/lib/auth.ts` already has an `owner` role + `tenantId`/`clinicName` on the session.
5. **Make Infinite Suite OS live** (path decision in §2), wired to auth + tenant.
6. **Owner account provisioning** to replace the single hardcoded demo login.

The contract Daniel codes against is `OwnerRadarData` in `src/lib/owner-demo-data.ts` and the
spec in `docs/RECOVERY_RADAR_OWNER_SPEC.md`. The master prompt is in
`docs/RECOVERY_RADAR_BUILD_BLUEPRINT.md`.

## 5. Hard guardrails (keep these — they're in the code already)

- **No PHI** anywhere in dashboards; learners are de-identified references.
- **Multi-tenant isolation** is non-negotiable.
- Dollar figures are **estimates pending human review** until a credentialed ABA biller
  validates the coding. Never imply auto-billing or a clinical/billing system of record.
- Recovery Radar **recommends and reports; the team decides and documents.**

---

## 6. Zoom demo walkthrough (drive this top to bottom)

**Setup:** `npm install` → `npm run dev` → open `http://localhost:3000`.

1. **Public homepage** — show the no-migration positioning, the Founding Pilot pricing, the
   Lost Hours Calculator. Point out the two doors at the bottom: **Team login** and
   **Owner login (Recovery Radar)**.
2. **Provider Portal tour** (`/provider-portal`) — "this is Infinite Suite OS, where field staff
   work — currently the static tour; this is what you'll make live and wire to the backend."
3. **Owner workspace** — click **Owner login (Recovery Radar)**, sign in with
   `demo@infinitepieces` / `infinitedemo`. Walk the four screens:
   - **Radar Overview** — recovery rate, hours/$ recovered, weekly trend (the ROI-proof number).
   - **By Learner & Site** — which recover most/least, across in-home/center/school.
   - **Recovery Waterfall** — how sessions got recovered (makeup/telehealth/SubPool/admin).
   - **Alerts** — at-risk signals.
   - Note the "demo data / estimate / human-review" labels everywhere.
4. **Founder workspace** — sign out, log in as `founders@infinitepieces.ai`, show the lead-gen /
   SEO Page Factory side (the growth engine). "This is my side — separate from the owner's."
5. **The pitch to Daniel:** "The UI for all three is done. The work is the backend pipe — make
   Infinite Suite OS live, build the tenant model, and feed real recovery events into Recovery
   Radar against the `OwnerRadarData` contract."

(Demo logins are for the demo only. Real accounts need proper provisioning — §4.6.)

## ⚠️ OWNER DATA BOUNDARY (added 2026-06-26) — aggregate only, no PHI
Recovery Radar's owner tier now shows recovery rolled up to **site + setting** only (`bySite`,
`bySetting` in `OwnerRadarData`). The owner shape carries **no individual client records** — by design,
so the owner data path can't leak PHI. Client names + per-learner detail live ONLY in Infinite Suite OS,
role-scoped to the assigned clinician (one director can't see another's caseload). When you wire real
data, roll learners up to site/setting BEFORE the data crosses the PHI boundary. Initials are not an
acceptable de-identifier in a small clinic — aggregate instead. Confirm the EMR↔Radar boundary in the
HIPAA audit. Full detail: docs/RECOVERY_RADAR_OWNER_SPEC.md.
