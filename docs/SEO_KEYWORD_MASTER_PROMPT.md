# MASTER PROMPT — Infinite Pieces AI: SEO Keyword + Internal-Linking Build
### (Paste this whole file to an AI engineer working inside the `recoveryradar` repo.)

---

## 0. ROLE & CONTEXT

You are an SEO + Next.js engineer working inside the **`recoveryradar`** repository
(Next.js 15, App Router, React 19, TypeScript, Tailwind). You are doing an on-page
keyword pass on existing marketing pages, creating a batch of new SEO landing pages,
and wiring an internal-linking "hub-and-spoke" so a new **School Portal** page becomes
the pillar that the whole school keyword cluster funnels into.

**Product naming (LOCKED — do not deviate):**
- **Infinite Pieces AI** = the company.
- **Infinite Suite OS™** = the product clinics license (where field staff — RBTs/BCBAs — work).
- **Recovery Radar™** = the owner/CEO dashboard (recovery rate, hours/$ recovered, alerts, staff pulse).
- **Recovery Waterfall™** = the method (a cancellation becomes a recovered, supported hour).
- **Infinite Classroom OS™** = the NEW **school edition** of Infinite Suite OS — same engine, minus the
  billing/recovery layer. This is what `/school-portal` markets. **This is the page everything links toward.**

**Key files:**
- Marketing pages: `src/app/page.tsx` (home), `src/app/calculator/page.tsx`, `src/app/quiz/page.tsx`,
  `src/app/topics/page.tsx` (topics index), `src/app/school-portal/page.tsx`, `src/app/provider-portal/page.tsx`.
- Nav / constants: `src/lib/constants.ts`. Header: `src/components/layout/MarketingHeader.tsx`. Sitemap: `src/app/sitemap.ts`.
- **SEO Page Factory** (preferred way to create new pages — it has guardrails built in):
  UI at `/seo-page-factory`; generator `src/lib/seo-page-generator.ts`; store `src/lib/seo-page-store.ts`;
  types `src/lib/seo-page-types.ts`; data file `data/seo-pages.json`; public renderer `src/app/topics/[slug]/page.tsx`.
  One page is already seeded and published: slug `centralreach-alternative-recovery-layer`.

---

## 1. HARD GUARDRAILS (apply to EVERY page and every line of copy)

1. **No fabricated statistics.** Do not invent search volumes, "% of clinics," dollar figures, or study results.
   Any illustrative number must be framed as a range/estimate and labeled as such. Prefer no number to a fake one.
2. **No competitor attacks.** For "alternative" pages (CentralReach, Rethink, etc.), frame as
   *"works alongside / an added layer / a complement"* — never *"X is bad/broken."* State facts neutrally.
3. **No clinical or billing guarantees.** Never claim the software diagnoses, recommends treatment, guarantees
   compliance, or guarantees correct/maximized reimbursement. Use *"supports,"* *"helps,"* *"designed to."*
   Nothing in these pages is clinical decision-support — keep it operational/business framing only.
4. **No PHI and no real student/patient data**, anywhere, including examples.
5. **Keep the EMR beside, not replaced.** Messaging is "add this layer *next to* your current system," not "rip and replace."
6. **One H1 per page.** Descriptive, keyword-bearing title + meta description (≤ 155 chars). Keyword in H1, first 100 words, one H2.
7. **Descriptive anchor text** for internal links (e.g., "school-based ABA data collection"), never "click here."
8. Run `npx tsc --noEmit` after changes; finish at **0 errors**. Do not commit `.env` or any secret.

---

## 2. PART A — On-page keyword pass for EXISTING pages

For each page below, update the `metadata` (title + description), the H1, and weave the primary +
2–3 secondary keywords naturally into the first paragraph and one subheading. Do **not** keyword-stuff.

| Page (file) | Primary keyword | Secondary keywords | Suggested `<title>` |
|---|---|---|---|
| Home `src/app/page.tsx` | ABA practice management software | reduce ABA cancellations, ABA session recovery, RBT retention | `ABA Practice Management Software That Recovers Lost Hours \| Infinite Pieces AI` |
| Calculator `src/app/calculator/page.tsx` | ABA lost revenue calculator | ABA cancellation cost, revenue leakage, missed session cost | `ABA Lost Hours Calculator — Estimate Cancellation Revenue Leakage` |
| Quiz `src/app/quiz/page.tsx` | ABA clinic operations assessment | ABA operations checklist, clinic efficiency | `ABA Operations Quiz — Find Your Clinic's Recovery Gaps` |
| Topics index `src/app/topics/page.tsx` | ABA clinic resources | ABA operations, school-based ABA, RBT retention | `ABA Operations & School ABA Resources \| Infinite Pieces AI` |
| Provider Portal `src/app/provider-portal/page.tsx` | ABA clinic operating system | Infinite Suite OS, ABA field tools | `Infinite Suite OS™ — The ABA Clinic Operating System (Tour)` |
| **School Portal `src/app/school-portal/page.tsx`** | **school-based ABA software** | ABA software for schools, special education data collection, classroom ABA | `School-Based ABA Software — Infinite Classroom OS™ \| Infinite Pieces AI` |

> Note: `/recovery-radar` and the founder dashboard are gated/private — leave them `noindex` (do not optimize for search).
> If `/aba-keyword-bank` is an internal tool, leave it `noindex` too.

---

## 3. PART B — NEW SEO pages to create

**Create these via the SEO Page Factory** (`/seo-page-factory` → generate → save → approve → publish),
which writes to `data/seo-pages.json` and renders at `/topics/<slug>`. If you build any by hand instead,
mirror the `SeoLandingPage` shape in `src/lib/seo-page-types.ts` and the renderer in
`src/app/topics/[slug]/page.tsx`. Each page needs: H1, meta description, 3–5 sections, a primary CTA,
and the internal links specified in Part C.

### 3A. SCHOOL spokes — every one links to `/school-portal` as primary CTA

| Slug | Primary keyword | Angle / H1 idea | Ties to app |
|---|---|---|---|
| `school-based-aba-software` | school based ABA software | "The ABA software built for a classroom, not a clinic" | (pillar support → /school-portal) |
| `special-education-data-collection-software` | special education data collection software | "Fast behavior + goal data your whole classroom team can keep" | Field Pocket |
| `iep-goal-tracking-software` | IEP goal tracking software | "Track IEP goals and targets without the binder" | Program Tree |
| `visual-schedule-maker-classroom` | visual schedule maker | "Make classroom visual schedules in minutes" | ZoneMate + Material Maker |
| `aac-for-schools` | AAC for schools | "Communication support that lives in the room" | Gestalt AAC |
| `paraprofessional-data-collection-app` | paraprofessional data collection app | "Data collection paras can actually keep up with" | Field Pocket |
| `behavior-data-collection-for-teachers` | behavior data collection for teachers | "Turn classroom behavior data into decisions" | Field Pocket + Analyst Pocket |
| `aba-in-the-classroom` | ABA in the classroom (informational) | "What school-based ABA looks like day to day" | top-of-funnel → /school-portal |

### 3B. CLINIC spokes — own your wedge (recovery + retention)

| Slug | Primary keyword | Angle / H1 idea |
|---|---|---|
| `reduce-aba-cancellations` | reduce ABA cancellations | "Turn cancellations into recovered, supported hours" (Recovery Waterfall pillar) |
| `aba-session-recovery-software` | ABA session recovery | "See the recovered-hour number before you pay" |
| `rbt-retention` | RBT retention | "Cut RBT turnover with a recovery loop that funds retention" |
| `aba-data-collection-software` | ABA data collection software | "Field-fast data collection for RBTs and BCBAs" |
| `aba-scheduling-software` | ABA scheduling software | "Scheduling that fills the gap a cancellation leaves" |
| `aba-practice-management-software` | ABA practice management software | the broad commercial pillar (link from home) |

> `centralreach-alternative-recovery-layer` already exists — keep it, and add it to the cross-links in Part C.

---

## 4. PART C — INTERNAL LINKING: the School hub-and-spoke (do this carefully)

**Model:** `/school-portal` (Infinite Classroom OS) is the **PILLAR HUB.** Every school spoke links *up* to it;
the hub links *down* to every spoke; spokes cross-link to 2–3 siblings. This concentrates topical authority on
the pillar and is the page you want to rank + convert for "ABA software for schools."

### 4.1 Hub → spokes (edit `src/app/school-portal/page.tsx`)
Add a **"School resources"** section near the bottom of the school portal with descriptive links to each
school spoke from 3A. Example anchors → targets:
- "School-based ABA software" → `/topics/school-based-aba-software`
- "Special education data collection" → `/topics/special-education-data-collection-software`
- "IEP goal tracking" → `/topics/iep-goal-tracking-software`
- "Classroom visual schedule maker" → `/topics/visual-schedule-maker-classroom`
- "AAC for schools" → `/topics/aac-for-schools`
- "Paraprofessional data collection app" → `/topics/paraprofessional-data-collection-app`
- "Behavior data collection for teachers" → `/topics/behavior-data-collection-for-teachers`
- "What ABA in the classroom looks like" → `/topics/aba-in-the-classroom`

### 4.2 Spokes → hub (in each new school page from 3A)
Every school spoke's **primary CTA** points to the pillar:
- Button anchor: "See Infinite Classroom OS™" → `/school-portal`
- Plus one in-body contextual link with a keyword anchor, e.g. "the **school edition of Infinite Suite OS**" → `/school-portal`.

### 4.3 Spoke ↔ sibling cross-links (2–3 each, keyword anchors)
- `visual-schedule-maker-classroom` ↔ `aac-for-schools` ↔ `paraprofessional-data-collection-app`
- `special-education-data-collection-software` ↔ `iep-goal-tracking-software` ↔ `behavior-data-collection-for-teachers`
- `aba-in-the-classroom` → links to all of the above (it's the informational feeder).

### 4.4 Cross-edition links (clinic pages that have a school angle)
On these clinic pages, add one line: *"Running ABA in a school instead of a clinic? See [Infinite Classroom OS™](/school-portal)."*
- `aba-data-collection-software` → `/school-portal`
- `visual` / Material-Maker mentions anywhere → `/school-portal`
- Topics index `src/app/topics/page.tsx` → add a **"For schools"** subsection linking the pillar + 3 school spokes.

### 4.5 Global entry points
- **Header** (`MarketingHeader.tsx`): School Portal button already present (faint dashed preview) — leave it.
- **Footer:** add a "School edition — Infinite Classroom OS" link → `/school-portal` (if a footer component exists).
- **Sitemap** (`src/app/sitemap.ts`): ensure every new `/topics/<slug>` and `/school-portal` is included.
- **Keyword Bank** (`/aba-keyword-bank` data): add the school keyword clusters from Part D so they're tracked.

### 4.6 Linking rules
- Descriptive keyword anchors only. No "click here."
- Don't over-link: ~3–6 internal links per page body is plenty.
- Every school spoke must link to the pillar **at least twice** (one CTA button + one in-body).

---

## 5. PART D — KEYWORD MASTER LIST (by cluster + intent)

> Candidates from ABA-domain knowledge. **Validate volume/difficulty in a real tool before committing.**
> "Commercial" = buyer intent (target on product/landing pages). "Info" = top-of-funnel (target on /topics articles).

### SCHOOL CLUSTERS (priority — funnel all of these toward `/school-portal`)
- **S1 · School-based ABA software (commercial — pillar):** school based ABA software · ABA software for schools ·
  classroom ABA software · ABA in schools software · school ABA data collection · ABA platform for schools
- **S2 · Special-ed data collection (commercial):** special education data collection software · IEP data collection software ·
  IEP goal tracking software · progress monitoring software special education · special ed data tracking app · goal tracking for IEPs
- **S3 · Visual schedules / supports (commercial + info):** visual schedule maker · visual schedule app for classroom ·
  classroom visual schedule · first-then board app · visual supports for special education · visual schedule maker for autism
- **S4 · AAC for schools (commercial):** AAC for schools · classroom AAC · AAC app for special education ·
  AAC device for school · gestalt language processing AAC
- **S5 · Para / classroom team tools (commercial):** paraprofessional data collection app · para data collection ·
  classroom behavior tracking app · behavior tracking app for teachers · special education classroom management app
- **S6 · School BCBA / supervision (commercial):** school BCBA tools · BCBA in schools · ABA program supervision software ·
  IEP goal bank · program targets software
- **S7 · School informational (info):** ABA in the classroom · what is school-based ABA · benefits of ABA in schools ·
  how to collect behavior data in the classroom · supporting students with autism in the classroom · visual schedules for autism classroom

### CLINIC CLUSTERS (own the recovery/retention wedge)
- **C1 · Practice/ops software (commercial):** ABA practice management software · ABA clinic management software ·
  ABA therapy software · applied behavior analysis software · ABA clinic operations software
- **C2 · Data collection (commercial):** ABA data collection software · ABA data collection app · behavior data collection app ·
  electronic ABA data collection · ABA session notes software
- **C3 · Scheduling/staffing (commercial):** ABA scheduling software · RBT scheduling software · ABA staff scheduling · ABA appointment scheduling
- **C4 · Session recovery / cancellations (WEDGE — own it):** reduce ABA cancellations · ABA session recovery ·
  recover cancelled ABA sessions · ABA authorization utilization · ABA revenue leakage · ABA missed session revenue
- **C5 · RBT retention (WEDGE):** RBT turnover · RBT retention · reduce RBT burnout · ABA staff retention · RBT retention strategies
- **C6 · Billing/RCM (CAREFUL — "supports," never "guarantees"):** ABA billing software · ABA revenue cycle management · ABA insurance billing · ABA claims management
- **C7 · Alternative/comparison (NO attacks):** CentralReach alternative · Rethink Behavioral Health alternative · best ABA software · ABA software comparison
- **C8 · Clinic informational (info):** what is an RBT · ABA clinic KPIs · how to reduce no-shows ABA · ABA clinic operations checklist

---

## 6. PART E — EXECUTION ORDER & DEFINITION OF DONE

1. Part A on-page passes (fast, no new routes).
2. Create school spokes (3A) via the SEO Page Factory; publish; verify they render at `/topics/<slug>`.
3. Create clinic spokes (3B).
4. Wire all internal links per Part C (hub→spokes, spokes→hub, siblings, cross-edition, global).
5. Update `sitemap.ts` and the Keyword Bank list.
6. `npx tsc --noEmit` → **0 errors.** No secrets committed.

**Done when:** every school keyword cluster has a page, `/school-portal` links to and is linked from every
school spoke (≥2 links back from each), the topics index has a "For schools" section, the sitemap includes
all new URLs, and the build typechecks clean — with **zero fabricated stats, zero competitor attacks, and zero
clinical/billing guarantees** anywhere in the new copy.
