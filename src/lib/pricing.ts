// ============================================================================
// PUBLIC PRICING + POSITIONING — numberless, and framed around OUTCOMES.
// ----------------------------------------------------------------------------
// Framing rule (important): we never sell "more hours" or "more revenue" as the
// goal. Recovering a cancelled session = DELIVERING the care a child's plan
// ALREADY AUTHORIZED — restoring continuity, not inflating dosage. Infinite never
// recommends, sets, or increases a child's hours; the BCBA owns the plan. We help
// authorized care actually get delivered, and surface whether it's producing
// progress — not just whether it was billed. (This keeps us clear of the
// "measure success by hours billed" critique, and out of clinical decision-making.)
//
// Public site is numberless: a Founding Clinic Program + demo CTA. Exact tiers are
// quoted per clinic from docs/INTERNAL_PRICING_SHEET.md (NOT public). Founding
// clinics lock their rate for life.
// ============================================================================
export const offer = {
  positioning: "Keep your current EMR. Add Infinite Suite OS™ beside it.",
  marketLine: "Competitors count hours billed. Infinite makes sure approved care actually happens — and proves it's working.",

  // The trust statement that answers "isn't this just billing more hours?" head-on.
  careFrame:
    "Infinite never recommends or increases a child's hours — the BCBA owns the plan. It recovers sessions that were already authorized and then lost to a cancellation or callout, so approved care actually gets delivered. And it shows whether those hours are producing progress — not just whether they were billed.",
  careFrameTag: "Precision over volume. Continuity, not dosage.",

  foundingProgram: {
    eyebrow: "Founding Clinic Program",
    headline: "Founding Clinic Program",
    limited: "Limited to the first 10 clinics.",
    subhead:
      "Keep your EMR. Add Infinite beside it so the care your clients are already approved for actually gets delivered — and so you can see it's working. We price against what it recovers for your clinic, proven in a pilot first, then locked in for life.",
    includes: [
      "No EMR migration — Infinite runs beside your current system",
      "Unlimited staff seats — never penalized for turnover, substitutes, or supervisors",
      "Unlimited caregiver seats",
      "Founder-led onboarding",
      "Founding pricing, locked for life for the first 10 clinics",
      "Month-to-month — no annual lock-in"
    ],
    pilot: {
      label: "Free design-partner pilot",
      body:
        "The first 1–2 clinics start on a free 3–6 month pilot — you see your recovered-care number, and whether it's moving outcomes, before you pay anything."
    },
    guarantee: {
      label: "Recover, or don't pay",
      body:
        "If Infinite doesn't recover a meaningful, agreed-upon number of authorized hours in your first 90 days, you don't pay for them."
    },
    cta: {
      label: "Book a demo for a custom proposal",
      note: "We'll run the recovery calculator with you on the call — your pricing follows your numbers."
    }
  },

  pricingModel: [
    "Priced by clinic size — not per user",
    "Unlimited staff + caregiver seats",
    "A free pilot proves the lift before you pay"
  ],

  // ROI framing — recovered AUTHORIZED care vs. the fee. The "not added hours" defense
  // is baked into the line itself. Always illustrative; never per-learner math.
  salesMath: { sessionsRecovered: 7, hoursPerSession: 2, ratePerHour: 77, monthlyRecoveredValue: 1078 },
  roiLine: "Every session Infinite recovers is care a child's plan already authorized — delivered, not added. Recovering even a few a month can pay for itself.",
  breakEvenDisclaimer:
    "Recovery, dollar, and progress figures are illustrative and depend on session length, reimbursement, payer mix, the clinical plan, and recovery workflow — validated against your real numbers in the pilot. Infinite is not a billing or clinical system of record and never sets or recommends a child's hours.",

  objections: [
    ["We already have an EMR.", "Keep it. Infinite sits beside it — no migration."],
    ["Isn't this just billing more hours?", "No. Infinite never adds or recommends hours — the BCBA sets the plan. It recovers sessions that were already authorized, so the care a family was promised actually happens, and it shows whether those hours are producing progress."],
    ["Per-user pricing gets expensive.", "We don't charge per user. Pricing is by clinic size, with unlimited staff and caregiver seats."],
    ["We don't know if it will work.", "That's what the free pilot is for — you see the recovered-care number, and whether it's moving outcomes, before you pay anything."],
    ["Our biggest pain is staff turnover.", "Recovering already-authorized hours and gating clean notes takes pressure off the floor — the retention relief follows a clinic that isn't drowning in lost sessions and late notes."]
  ]
} as const;
