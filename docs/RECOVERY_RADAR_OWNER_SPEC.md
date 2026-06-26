# Recovery Radar™ — Owner Dashboard product spec

**One line:** The clinic owner's command center — a CEO logs in and watches how well Infinite
Suite OS™ is recovering hours across their clinic(s), instead of having to trust that it works.

This is the **ROI-proof layer.** Your pricing promise is "prove it on recovery — see the
recovered-hour number before you pay." Recovery Radar *is* that number made visible.

---

## Who it's for
Owners / CEOs / clinical directors of ABA clinics running Infinite Suite OS beside their EMR —
across settings: in-home, center-based, school-based, single-site or multi-site.

## The mirror-image model
- **Founder workspace** (you): scans the *market* to find clinics to sell to (outward).
- **Owner workspace** (Recovery Radar): scans the owner's *own clinic* to show what the
  software is recovering (inward).
Same shape, opposite direction. Each role has its own login and sees only its own data.

## What the owner sees (v1 — shipped as a demo)
1. **Radar Overview** — headline metrics: recovery rate (% of at-risk sessions recovered),
   hours recovered, estimated value recovered (labeled an estimate), sessions at risk; plus a
   recovered-vs-at-risk trend by week.
2. **By Learner & Site** — recovery rate ranked by learner (de-identified) and site/setting, so
   the owner sees which recover most and least and where to intervene.
3. **Recovery Waterfall** — how sessions actually recovered (makeup / telehealth parent-training
   / SubPool substitute / supported admin time), with the flow diagram.
4. **Alerts** — at-risk signals ("recovery slipping at South Center"), as prompts for a human to
   review — never automated actions.

## Metrics that matter (the data model)
Per clinic (tenant), per period:
- `recoveryRate`, `sessionsAtRisk`, `sessionsRecovered`, `hoursRecovered`,
  `estimatedDollarsRecovered`
- `weeklyTrend[]` (atRisk vs recovered)
- `byLearner[]` (de-identified ref, site, setting, atRisk, recovered, rate, trend)
- `byMethod[]` (recovery method → count + share)
- `alerts[]` (severity, title, detail)

(See `src/lib/owner-demo-data.ts` for the exact shape — production reads the same shape from
the real backend.)

## The hard requirements (Daniel's domain — this is the real work)
1. **Multi-tenant isolation.** Each owner sees ONLY their clinic's data, scoped by `tenantId`.
   This is the P0 tenant-isolation work — non-negotiable.
2. **De-identification / no PHI in the dashboard.** Learners are references, not names. Owners
   are authorized for their clinic, but it's still protected operational data and must be
   handled HIPAA-aware.
3. **Real recovery data must flow** from live clinic operations (cancellations, recoveries,
   methods) into the metrics. The dashboard is only impressive once the numbers are real.
4. **Dollar figures must be trustworthy** — they depend on correct billing/coding, which loops
   back to the credentialed-biller validation need. Until validated, every figure is labeled an
   estimate pending review.
5. **Auth/role separation.** Owner role can't reach the founder workspace and vice versa.

## What's built now (demo)
- Owner login `demo@infinitepieces / infinitedemo` (role `owner`, tenant `demo-clinic`).
- Owner route group `/recovery-radar` (+ `/learners`, `/waterfall`, `/alerts`), separate shell,
  role-guarded, middleware-protected.
- De-identified demo data, every view labeled "demo / estimate / human-review."
- Public landing now splits the duplicate Provider Portal button into a public **Tour** and an
  **Owner login (Recovery Radar)**.

## What's NOT built (needs the backend + real data)
- Real per-tenant data pipeline (currently sample data).
- Owner account provisioning / invitations (currently one hardcoded demo login).
- Export / scheduled email summaries.
- Drill-down from a metric to the underlying (de-identified) sessions.

## Phasing
- **Now:** demo dashboard (done) — use it in sales conversations to show the vision.
- **Phase 2:** wire to real recovery data per tenant during a Founding Pilot; the dashboard
  becomes live ROI proof.
- **Phase 3:** owner self-serve accounts, exports, alerts by email, deeper drill-downs.

---

## Staff Pulse (added 2026-06-26) — anonymous retention early-warning + the recovered-hours loop

**What it is for the owner:** an anonymous read on staff wellbeing so owners act on burnout
before it becomes turnover. Surfaced in Recovery Radar at `/recovery-radar/pulse`.

**The loop (the product's differentiator):** the recovery pool recovers money → Staff Pulse
shows morale → when a site goes red, the dashboard offers **interventions funded by the
recovered-hours budget** (bigger SubPool points, quota bonuses, materials, a staff event), not
the owner's own money → the owner pulls a lever and watches the pulse move. Recovery pays for
retention; retention drives recovery.

**Anonymity model — a HARD requirement Daniel must enforce in the backend, not just the UI:**
- The owner/CEO sees **clinic and site-level weekly averages only** — never an individual's
  reading, never a name.
- **Small-n suppression:** a site/group is not shown if too few staff would make a reading
  identifiable (set a floor, e.g. n ≥ 4).
- Identifying *who* said what is reserved for the **BCBA or scheduler admin directly assigned
  to that staff member**, inside Infinite Suite OS — a separate, permissioned surface. (The
  owner role must never be able to reach individual readings.) The exact BCBA/admin-assignment
  logistic is to be designed when we build the sandbox.
- Collection must be transparent to staff (they know wellbeing pulses are gathered and
  aggregated) — build it as a support tool with staff buy-in, not covert monitoring.

**Data shape:** see `StaffPulse` in `src/lib/owner-demo-data.ts` (clinicScore, status,
weeklyScores, bySite [no names], themes [anonymized], recoveredHoursBudget, interventions).
Costs and dollar figures are estimates pending review.

## UI note (2026-06-26)
The owner workspace was restyled to a dark "command-center" aesthetic (deep navy, cyan/violet
glow, glassy panels) with hand-rolled SVG charts (sparklines, donut gauge, area trend, funnel,
status bars) in `src/components/owner/radar-ui.tsx` — no chart dependency. Theme lives in the
shared kit + `OwnerShell`, so all owner pages share it.

---

## DATA BOUNDARY — owner tier is SITE/SETTING aggregate only (HARD requirement, 2026-06-26)

The owner/CEO tier of Recovery Radar shows recovery rolled up to **site and setting level only** —
**never an individual learner, never a client name.** This is the same minimum-necessary principle as
the Staff Pulse anonymity model, applied to recovery data.

**Why:** Recovery Radar sits OUTSIDE the PHI zone. Client names and per-learner detail belong only inside
Infinite Suite OS (the HIPAA system of record), visible only to the clinician assigned to that learner.
In a small clinic, initials + site + session counts re-identify a child instantly, so initials are NOT an
acceptable de-identification method — aggregate to site/setting instead.

**What this means in code (for Daniel):**
- The `OwnerRadarData` shape carries **no individual client records** — only `bySite` and `bySetting`
  aggregates. The owner data path therefore cannot leak PHI even if the query layer has a bug.
- The owner role must NEVER receive per-learner rows. Roll up `recoveryRate`, at-risk, and recovered
  counts across all learners at a site before the data ever leaves the PHI boundary.
- Per-learner drill-down is a separate, role-scoped surface INSIDE Infinite Suite OS: a BCBA/scheduler
  sees only the learners they are assigned to (one director cannot see another director's caseload).
- Confirm this EMR ↔ Recovery Radar data-flow boundary with a HIPAA/BACB-aware compliance reviewer
  during the HIPAA audit.
