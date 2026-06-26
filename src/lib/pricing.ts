export const offer = {
  positioning: "Keep your current EMR. Add Infinite Suite OS™ beside it.",
  marketLine: "Competitors manage the record. Infinite recovers the hour — and proves it.",
  pricingModel: ["Performance pilot to prove the lift", "Flat per-site plans to scale", "Unlimited staff + caregiver seats"],
  // Strategy: performance pricing is the FOUNDING PROOF tool (cleanest way to show the
  // recovered-dollar lift). Clinics then convert to flat per-site tiers, which scale with
  // site count and avoid monthly "what counts as recovered" disputes.
  plans: [
    {
      name: "Founding Pilot — prove it on our dime",
      price: "Performance-based",
      subprice: "90-day proof window",
      details: [
        "we measure your current recovery rate first",
        "you pay a small share only of what we recover above that line",
        "no flat fee during the proof window",
        "see the recovered-hour number before you commit",
        "1–2 founding clinics per cohort"
      ]
    },
    {
      name: "Recovery Core",
      price: "~$1,000 / site / month",
      subprice: "break-even ≈ 7 recovered sessions/mo",
      details: [
        "the full recovery cascade + scoreboard",
        "note-gating compliance (clean claims)",
        "unlimited staff + caregiver seats",
        "no implementation fee on pilot conversion"
      ]
    },
    {
      name: "Core + Compliance",
      price: "~$1,500 / site / month",
      subprice: "break-even ≈ 10 recovered sessions/mo",
      details: [
        "everything in Recovery Core",
        "Compliance Sentinel proof packets",
        "documentation-defect tracking before export",
        "best for clinics that live on clean claims"
      ]
    },
    {
      name: "Full Stack",
      price: "~$2,000–2,500 / site / month",
      subprice: "+ API Integration Hub",
      details: [
        "everything in Core + Compliance",
        "export bridges beside your current EMR",
        "priced around recovered operational value",
        "Enterprise (multi-site): custom, per-site — scales with site count"
      ]
    }
  ],
  // Realistic anchor: 1 recovered session ≈ 2 billable hrs × ~$77 collected ≈ ~$155.
  // (Illustrative — validate against real payer mix.)
  salesMath: {
    sessionsRecovered: 7,
    hoursPerSession: 2,
    ratePerHour: 77,
    monthlyRecoveredValue: 1078
  },
  objections: [
    ["We already have an EMR.", "Keep it. Infinite sits beside it — no migration."],
    ["Per-user pricing gets expensive.", "Flat per-site. Unlimited staff and caregiver seats."],
    ["We don't know if it will work.", "Founding pilot is performance-based — you see the recovered-hour number before you pay a flat fee."],
    ["Why not just pay you a percentage forever?", "Flat pricing is predictable, avoids monthly disputes over what counts as 'recovered,' and scales with you through site count — not by taxing your success."],
    ["Our biggest pain is staff turnover.", "Recovery + note-gating protect hours and clean claims; the retention relief follows from a clinic that isn't drowning in lost hours and late notes."]
  ]
} as const;
