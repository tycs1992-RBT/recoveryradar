# Recovery Radar™ Product Specification

Recovery Radar™ is a growth platform for Infinite Pieces AI that captures and qualifies demand from ABA clinic owners, founders, clinical directors, operations managers, and schedulers who are shopping for practice-management or EMR software.

The product reframes the conversation away from “replace the EMR” and toward operational recovery.

> Keep your current EMR. Add Infinite Suite beside it. Recover lost hours, support staff and caregivers, and prepare cleaner, review-ready documentation.

## Product thesis

Clinics often start shopping for a new EMR because daily operations feel broken: cancellations, RBT callouts, caregiver communication delays, authorization utilization risk, and documentation cleanup. Recovery Radar™ helps quantify those problems and routes the buyer toward Infinite Suite OS™ as a no-migration recovery layer beside the existing EMR.

## Core subsystems

1. **EMR Buyer Intent Finder** — gathers public-source signals from search APIs, public pages, job postings, directories, and announcements.
2. **Lost Hours Calculator** — estimates weekly/monthly hours at risk, revenue leakage, admin burden, and potential recovered hours.
3. **ABA Operations Stack Quiz** — segments visitors into persona paths and recommends Infinite Suite modules.
4. **Website Conversion Bot** — controlled no-PHI chatbot that routes visitors to the calculator, quiz, demo, or opt-in lead capture.
5. **Lead Scoring & CRM Dashboard** — consolidates sources, scores leads, tracks status, drafts outreach, and logs audit events.

## Positioning guardrails

- Do not sell Infinite Suite OS™ as an EMR replacement.
- Say “no-migration operational recovery layer” or “sits beside your current EMR.”
- Do not ask for PHI.
- Do not claim blanket HIPAA compliance.
- Use privacy-aware, HIPAA-conscious, consent-aware, role-based access, and audit-readiness language.
- Use public data only for Intent Finder.
- Keep outreach manual-review only.

## Public conversion routes

- `/calculator`
- `/lost-hours-calculator`
- `/quiz`
- `/aba-operations-stack-quiz`
- `/chatbot/embed`
- `/aba-emr-alternative`
- `/centralreach-alternative`
- `/aba-scheduling-recovery`
- `/new-aba-clinic-software-stack`
- `/aba-cancellation-recovery`
- `/rbt-callout-coverage`
- `/aba-lost-hours-calculator`
- `/founding-clinic-beta`

## Internal workspace routes

- `/dashboard`
- `/lead-finder`
- `/keyword-radar`
- `/bot-builder`
- `/recovery-advisor-chatbot`
- `/crm`
- `/outreach`
- `/outreach-templates`
- `/content-generator`
- `/campaign-planner`
- `/analytics`
- `/settings`

## Calculator formula summary

- Scheduled sessions per week = clients × sessions per client per week
- Total scheduled hours = scheduled sessions × average session length
- Cancellations per week = scheduled sessions × cancellation rate
- Callouts per week = scheduled sessions × callout rate
- Hours at risk = (cancellations + callouts) × session length
- Weekly revenue at risk = hours at risk × reimbursement per hour
- Monthly revenue leakage = weekly revenue at risk × 4
- Recovered sessions = interruption events × current recovery rate
- Admin hours = interruption events × admin minutes ÷ 60 + documentation cleanup estimate
- Potential recovered hours = hours at risk × 10%, 20%, or 30%

## Quiz segments

- EMR Shopper
- Recovery Layer Candidate
- Staff Support Candidate
- Documentation Readiness Candidate
- New Clinic Stack Builder
- Multi-Location Operations Candidate

## Lead score tiers

- 60–100: Hot
- 30–59: Research
- 0–29: Low/nurture
- Do-not-contact: suppression/no outreach
