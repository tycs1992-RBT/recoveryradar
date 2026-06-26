# Recovery Radar™ Owner Workspace — Build Blueprint, Schedule & Master Prompt

This doc does three things: (1) records what's already built, (2) gives a logistics schedule to
take it from demo to production, (3) provides a copy-paste **master prompt** you can hand to
ChatGPT (or any AI engineer) to extend it inside the existing `recoveryradar` Next.js app.

---

## 1. What's already built (the demo is done)

A separate, role-guarded **owner workspace** in the existing App Router app:

- **Auth:** `owner` role added; demo login `demo@infinitepieces / infinitedemo` (tenant
  `demo-clinic`, clinic "North Star ABA"). Founder login unchanged.
- **Routes:** `/recovery-radar` (overview), `/recovery-radar/learners`,
  `/recovery-radar/waterfall`, `/recovery-radar/alerts` — under route group `(owner)` with its
  own shell (`src/components/owner/OwnerShell.tsx`), role-guarded in `(owner)/layout.tsx`.
- **Data:** `src/lib/owner-demo-data.ts` — de-identified sample metrics, keyed by `tenantId`
  (production swaps the lookup for a real query, same shape).
- **Security:** `/recovery-radar/*` and `/seo-page-factory/*` added to the middleware auth gate.
- **Public site:** duplicate Provider Portal button split into public **Tour** + **Owner login**.

## 2. Logistics schedule (demo → production)

| Phase | Goal | Owner | Depends on |
|---|---|---|---|
| 0 (done) | Demo owner workspace with sample data, for sales | — | — |
| 1 | Multi-tenant data model + isolation (each owner sees only their clinic) | Daniel | DB schema, RBAC |
| 2 | Recovery event pipeline — cancellations/recoveries/methods flow into per-tenant metrics | Daniel | Phase 1 |
| 3 | Swap `owner-demo-data.ts` for real per-tenant queries (same shape) | You + Daniel | Phase 2 |
| 4 | Billing/coding validation so $ figures are trustworthy | Credentialed ABA biller | — |
| 5 | Owner account provisioning + invitations (replace hardcoded demo login) | Daniel | Phase 1 |
| 6 | Exports, scheduled email summaries, metric drill-downs | You | Phase 3 |

**Critical path:** Phase 1 (tenant isolation) → Phase 2 (real data) → Phase 3 (wire it). The UI
is done; the value is in the data plumbing, which is Daniel's P0 backend work.

## 3. UI / UX principles (already applied — keep them)

- **Two mirror workspaces, two logins.** Owner workspace is visually distinct (cyan Recovery
  Radar header) from the founder workspace (dark sidebar).
- **Lead with the headline number.** Recovery rate + hours/$ recovered are the first thing the
  owner sees — that's the ROI proof.
- **Always label demo/estimate/human-review.** Every figure carries that it's an estimate
  pending review; nothing implies auto-billing or a clinical/billing system of record.
- **De-identified, always.** Learners are references ("Learner A"), never names. No PHI.
- **Green/amber/red** for recovery health so an owner reads it at a glance.
- **Recommends and reports; the team decides and documents.** Alerts are prompts for humans.

---

## 4. MASTER PROMPT (paste into ChatGPT / give to an AI engineer)

> You are a senior Next.js (App Router) + TypeScript engineer working inside the existing
> `tycs1992-RBT/recoveryradar` repository. Do NOT scaffold a new app or restart anything; extend
> the current code. The app already has a demo **owner workspace** (Recovery Radar) for ABA
> clinic owners, separate from the internal founder workspace.
>
> **Context / naming (do not deviate):**
> - Infinite Pieces AI = company. Infinite Suite OS™ = the product clinics license.
> - Recovery Radar™ = the owner-facing dashboard showing how well the Recovery Waterfall™ is
>   recovering hours for that clinic. Recovery Waterfall™ = the method (cancel → Scheduler AI →
>   auth check → SubPool → telehealth → makeup → admin).
> - The internal lead-gen suite is separate, secret, behind auth — never reference it publicly.
>
> **What exists:** owner role + demo login (`demo@infinitepieces` / `infinitedemo`, tenant
> `demo-clinic`) in `src/lib/auth.ts`; route group `(owner)` with `/recovery-radar` overview,
> `/learners`, `/waterfall`, `/alerts`; shell `src/components/owner/OwnerShell.tsx`; demo data
> `src/lib/owner-demo-data.ts` (the canonical metric shape — keep it); middleware protects
> `/recovery-radar/*`.
>
> **Your task (pick what I ask for):**
> 1. Replace the file-backed `owner-demo-data.ts` lookup with a Prisma-backed query that returns
>    the **same `OwnerRadarData` shape**, scoped strictly by `tenantId` from the session. Add a
>    `Clinic`/tenant model and the recovery-event tables needed to compute: recoveryRate,
>    sessionsAtRisk/Recovered, hoursRecovered, estimatedDollarsRecovered, weeklyTrend, byLearner
>    (de-identified), byMethod, alerts.
> 2. Enforce tenant isolation everywhere: every query filters by the authenticated owner's
>    `tenantId`; no cross-tenant reads are possible; add tests proving an owner cannot read
>    another clinic's data.
> 3. Add owner-account provisioning (invite + credentialed login) to replace the hardcoded demo
>    login, without breaking the existing founder login.
> 4. Keep all UI guardrails: de-identified references only, no PHI, every dollar figure labeled
>    an estimate pending human review, "recommends/reports — team decides/documents," never an
>    auto-billing or system-of-record claim.
>
> **Constraints:** TypeScript strict, `npx tsc --noEmit` must pass, no secrets in code, don't
> touch the founder workspace, don't change the public marketing brand. Do not invent statistics
> or make HIPAA/billing guarantees. Show me a plan, then the diffs.

Use this prompt for whichever phase you're tackling; trim task list 1–4 to just the part you
want built next.
