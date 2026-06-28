// ============================================================================
// PUBLIC PRICING — intentionally NUMBERLESS.
// ----------------------------------------------------------------------------
// The public site shows a "Founding Clinic Program" with a demo CTA — no tiers,
// no dollar figures. We quote exact pricing per clinic from a private sheet AFTER
// a pilot proves the lift, and founding clinics lock their rate for life.
//
// Why numberless:
//   • As an early/unknown brand we don't yet have the data to publish a permanent
//     number — so we never publish one we'd have to walk back.
//   • Every conversation is anchored to RECOVERED DOLLARS vs. the fee — never to
//     per-learner math, which would make an add-on look pricier than the EMR it
//     sits beside.
//   • The model we DO lock: priced by clinic size (active learners), unlimited
//     staff + caregiver seats, free pilot, grandfathered founding rates.
//
// Exact tiers live in docs/INTERNAL_PRICING_SHEET.md (NOT rendered, NOT public).
// ============================================================================
export const offer = {
  positioning: "Keep your current EMR. Add Infinite Suite OS™ beside it.",
  marketLine: "Competitors manage the record. Infinite recovers the hour — and proves it.",

  foundingProgram: {
    eyebrow: "Founding Clinic Program",
    headline: "Founding Clinic Program",
    limited: "Limited to the first 10 clinics.",
    subhead:
      "Keep your EMR. Add Infinite beside it to recover lost operational value. We price against what it actually recovers for your clinic — proven in a pilot first, then locked in for life.",
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
        "The first 1–2 clinics start on a free 3–6 month pilot — you see your recovered-hour number before you pay anything."
    },
    guarantee: {
      label: "Recover, or don't pay",
      body:
        "If Infinite doesn't recover a meaningful, agreed-upon number of hours in your first 90 days, you don't pay for them."
    },
    cta: {
      label: "Book a demo for a custom proposal",
      note: "We'll run the recovery calculator with you on the call — your pricing follows your numbers."
    }
  },

  // What we lock publicly (the model), without committing to a number.
  pricingModel: [
    "Priced by clinic size — not per user",
    "Unlimited staff + caregiver seats",
    "A free pilot proves the lift before you pay"
  ],

  // ROI framing — ALWAYS lead with recovered dollars vs. the fee, never per-learner math.
  salesMath: { sessionsRecovered: 7, hoursPerSession: 2, ratePerHour: 77, monthlyRecoveredValue: 1078 },
  roiLine: "If Infinite Suite OS™ recovers just a few missed sessions a month, it can begin paying for itself.",
  breakEvenDisclaimer:
    "Recovery and dollar figures are illustrative and depend on session length, reimbursement rate, payer mix, and recovery workflow — validated against your real numbers in the pilot. This is not a billing or clinical system of record.",

  objections: [
    ["We already have an EMR.", "Keep it. Infinite sits beside it — no migration."],
    ["Per-user pricing gets expensive.", "We don't charge per user. Pricing is by clinic size, with unlimited staff and caregiver seats."],
    ["We don't know if it will work.", "That's what the free pilot is for — you see the recovered-hour number before you pay anything."],
    ["We're cautious about a newer vendor.", "Start free, stay month-to-month, and keep your EMR. If it doesn't recover hours, you don't pay."],
    ["Our biggest pain is staff turnover.", "Recovering lost hours and gating clean notes takes pressure off the floor — the retention relief follows a clinic that isn't drowning in lost hours."]
  ]
} as const;
