export const offer = {
  positioning: "Keep your current EMR. Add Infinite Suite OS™ beside it.",
  marketLine: "Competitors manage the record. Infinite recovers the hour.",
  pricingModel: ["Per active learner", "Unlimited staff seats", "Unlimited caregiver seats"],
  plans: [
    {
      name: "Design Partner Beta",
      price: "90 days free",
      subprice: "1–2 clinics only",
      details: [
        "structured feedback required",
        "monthly recovered-hour scorecard required",
        "permission to use anonymized outcomes if successful"
      ]
    },
    {
      name: "Founding Clinic Trial",
      price: "$15 / active learner",
      subprice: "$500/month minimum",
      details: [
        "unlimited staff seats",
        "unlimited caregiver seats",
        "no implementation fee for founding cohort",
        "3-month pilot",
        "recovered-hour scorecard included"
      ]
    },
    {
      name: "Standard Phase 1",
      price: "$20 / active learner",
      subprice: "$750/month minimum",
      details: [
        "unlimited staff seats",
        "unlimited caregiver seats",
        "optional implementation fee later",
        "priced around recovered operational value"
      ]
    }
  ],
  salesMath: {
    sessionsRecovered: 3,
    hoursPerSession: 3,
    ratePerHour: 80,
    monthlyRecoveredValue: 720
  },
  objections: [
    ["We already have an EMR.", "Keep it. Infinite sits beside it."],
    ["Per-user pricing gets expensive.", "Unlimited staff and caregiver seats."],
    ["We do not know if it will work.", "3-month founding trial and recovered-hour ROI scorecard."],
    ["Our biggest pain is cancellations.", "Infinite focuses on lost-hour recovery first."]
  ]
} as const;
