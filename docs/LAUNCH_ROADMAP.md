# Infinite Suite OS — Launch Roadmap (to September)
### Our shared, sequenced worklist. Built from the external audit + Claude's meta-audit ("audit the audit").

---

## 0. Meta-audit — auditing the audit

The external audit is strong and its security findings are real. Key meta-observations:

- **It validates the privacy work we already did.** Its top recommendations — Staff Pulse aggregate-only,
  minimum cell size of 5, owner sees aggregates (not individuals), no PHI outside the EMR, Team Pulse as a
  panel not a separate app — are *exactly* what we locked in this session. Independent confirmation we're right.
- **Some findings predate our work** and are already resolved: the owner "By Learner & Site" view is now
  site/setting aggregates (no per-learner records in `OwnerRadarData`); naming is consistent; the school
  edition exists; the homepage stale "growth machine" copy is fixed.
- **One real bug in the audit's own patch:** its RBAC guard example `can(role, "read")` would let a *clinic
  owner* (a customer) reach the founder's internal lead data, because the owner role also has `read`. We
  fixed this correctly with a founder-only `workspace` permission (admin/growth only).
- **The #1 most urgent item is YOURS and can't wait:** rotate the exposed secrets (see below). No code change
  substitutes for rotation.
- **Build-gate caution:** flipping `ignoreBuildErrors`/`ignoreDuringBuilds` to false is only safe because we
  verified `tsc` AND `eslint` both pass at 0. Always re-verify before pushing config like that.

---

## 1. 🔴 CRITICAL — your action, do first (can't be done in code)

- [ ] **Rotate every exposed secret.** The audit found real-looking AI keys + a Vercel OIDC token in uploaded
      `.env` files. Rotate `NEXTAUTH_SECRET`, any AI/search API keys, and revoke/reissue the Vercel token.
- [ ] **Check git history for committed secrets:** `git log --all -- .env` (and `.env.local`, `server/.env`).
      If any real secret was ever committed, rotate it and consider history scrub (BFG / filter-repo).
- [ ] **Set production env vars in Vercel** so the demo + auth work in prod: `NEXTAUTH_SECRET` (required now —
      the app throws without it in prod), and `DEMO_OWNER_EMAIL` / `DEMO_OWNER_PASSWORD` / `DEMO_ADMIN_EMAIL`
      / `DEMO_ADMIN_PASSWORD` if you want the demo logins to work on the live site.

---

## 2. Phase 1 — Stabilize (Next repo) — IN PROGRESS

| Item | Status |
|---|---|
| Owner data boundary: site/setting aggregates only, no PHI in owner shape | ✅ done (prior batch) |
| `next.config.mjs`: stop suppressing TS/ESLint; add security headers | ✅ done |
| Fix the 2 `no-explicit-any` errors; eslint ignores compiled assets + `next-env` | ✅ done |
| `auth.ts`: require `NEXTAUTH_SECRET` in prod; demo passwords dev-only (no usable prod secret) | ✅ done |
| Guard founder-workspace API routes (export/leads, leads, outreach-tasks, hubspot/sync-lead) | ✅ done (`requireWorkspace`, admin/growth only) |
| Scrub demo password from README | ✅ done |
| Provider-portal iframe: `referrerPolicy` (sandbox left optional to avoid breaking the demo) | ✅ done |
| Apply the same `requireWorkspace` guard to any *other* internal API routes | ⏳ next — sweep all 31 routes |
| Local verification: `npm run lint && npm run build` clean before pushing | ⏳ your check |

---

## 3. Phase 1 — Stabilize (sandbox / Core 9 repo `core8-project`) — NEXT UP

| Item | Status |
|---|---|
| Fix broken `src/routes.example.jsx` import of missing `./Gestalt_AAC.jsx` → point to `InfiniteSuiteOS` | ⏳ |
| Add `api` / `api:dev` scripts + `/api` proxy in `vite.config.js` (wire frontend↔backend starter) | ⏳ |
| Icon-import sweep (lucide-react used-but-not-imported → runtime crashes) across all modules | ⏳ |
| Remove stale compiled provider assets from `public/provider-os/assets/` (Next repo) where appropriate | ⏳ |

---

## 4. Phase 2 — Core recovery loop (the IP) — sandbox

| Item | Owner | Status |
|---|---|---|
| **Recovery optimizer** in `SchedulerAI.jsx`: `scoreRecoveryOption()` + `rankRecoveryOptions()` — maximize recovered-$/cancelled-hr under hard constraints (auth window, eligibility, geofence) + soft (RBT continuity, burnout). Decision tree stays as the safety floor. | Claude + Tyler | ⏳ priority |
| Motherboard OS: split the ~3k-line shell into OS-state store, work bar, proof-packet service, routing shell | Claude | ⏳ |
| Scheduler AI / Care Pocket / FieldPocket hardening (simplify, demo-safe, clear handoffs) | Claude | ⏳ |
| SubPool + Auth War Room: eligibility rules, incentive ledger, posting lifecycle, fatigue guardrails | Claude (UI) / Daniel (data) | ⏳ |
| Material Maker refinement: export cleanup, print QA, AI-failure states, review flags | Claude | ⏳ |
| Compliance Sentinel: server-calculated checks, immutable audit trail framing | Claude (UI) / Daniel (data) | ⏳ |

---

## 5. Phase 3 — Owner surface + interventions

| Item | Status |
|---|---|
| Owner command center: real aggregates, intervention budget engine, Staff Pulse guardrails (min cell size 5) | mostly built; needs the data contract wired |
| Staff Pulse BCBA/admin individual-readings surface (role-scoped, inside Infinite Suite OS) | ⏳ sandbox |
| Intervention plays funded by the recovered-hours budget | ⏳ |

---

## 6. Daniel's lane — backend / security / data (NOT ours)

The audit's target architecture is the spec. Daniel builds:
- Multi-tenant data model + isolation (P0): tenant/clinic/site/client-ref/role-assignment/authorization/
  work-item/recovery-opportunity/session/staff-pulse-entry/staff-pulse-aggregate/intervention/audit-event.
- Recovery-event pipeline (Infinite Suite OS actions → persisted events → per-tenant metrics).
- Wire Recovery Radar to real data (swap `owner-demo-data.ts` lookup for a tenant-scoped query, SAME shape).
- RBAC enforced server-side (founder / owner / scheduler / BCBA / RBT / caregiver), durable audit store,
  Redis/KV rate limits (replace in-memory), tenant-scoped everything.
- The contract he codes to: `OwnerRadarData` shape (owner = aggregate only, no PHI) + the data contract
  in `DANIEL_HANDOFF.md` + the entity model in the audit.

---

## 7. Working cadence

Small, verified batches. Every batch: `tsc` (Next) or run-the-app (sandbox) → 0 errors → package → push.
Frontend/UX/hardening = Claude + Tyler. Backend/infra/data/security = Daniel. Legal (trademark filing,
HIPAA sign-off) = attorney + compliance reviewer. Validate every $ figure with a real clinic before public
hard claims.
