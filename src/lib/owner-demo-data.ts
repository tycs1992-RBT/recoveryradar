/**
 * DEMO data for the owner-facing Recovery Radar dashboard.
 *
 * Illustrative, fully DE-IDENTIFIED sample data only — NO real client or staff information.
 * Learners are references ("Learner A"); Staff Pulse is reported as CLINIC/SITE-LEVEL WEEKLY
 * AVERAGES only — never an individual. At the owner/CEO level, no staff member is ever
 * identifiable. Individual-level readings are a separate surface for the assigned BCBA /
 * scheduler admin only (handled in Infinite Suite OS, not here). Nothing here is PHI.
 *
 * Production reads one clinic's real metrics from the multi-tenant backend, scoped to its
 * tenantId, returning this same OwnerRadarData shape.
 */

export type RecoveryMethod =
  | "Makeup (in-person)"
  | "Telehealth parent-training"
  | "SubPool substitute"
  | "Supported admin time";

export type Status = "green" | "amber" | "red";

export type WeeklyTrendPoint = { weekLabel: string; atRisk: number; recovered: number };

/**
 * Owner tier sees recovery rolled up to SITE and SETTING level only — never an individual
 * learner, never a name. Per-learner detail is reserved for the assigned clinician inside
 * Infinite Suite OS (the HIPAA system of record where PHI lives). This shape carries NO
 * individual client records by design, so the owner data path can never leak PHI.
 */
export type SiteRecovery = {
  site: string;
  setting: "In-home" | "Center" | "School";
  atRiskSessions: number;     // rolled up across all learners at this site — no individuals
  recoveredSessions: number;
  recoveryRate: number;
  trend: "up" | "down" | "flat";
};

export type SettingRecovery = {
  setting: "In-home" | "Center" | "School";
  atRiskSessions: number;
  recoveredSessions: number;
  recoveryRate: number;
};

export type MethodBreakdown = { method: RecoveryMethod; recoveredSessions: number; share: number };

export type AlertItem = { severity: "high" | "medium" | "low"; title: string; detail: string };

/** Staff Pulse — anonymous, clinic/site-level wellbeing signals (retention early-warning). */
export type SitePulse = { site: string; score: number; status: Status; trend: "up" | "down" | "flat"; staffCount: number };
export type PulseTheme = { label: string; mentions: number; sentiment: "positive" | "concern" };
export type Intervention = { title: string; detail: string; estCost: number; lever: string; expectedLift?: string };

export type StaffPulse = {
  clinicScore: number;            // 0-100, current-week average across ALL staff (anonymous)
  status: Status;
  weeklyScores: { weekLabel: string; score: number }[];
  bySite: SitePulse[];            // site-level averages — NEVER individuals
  themes: PulseTheme[];           // anonymized aggregate themes
  recoveredHoursBudget: number;   // $ available to reinvest, funded by recovered hours
  interventions: Intervention[];  // plays the owner can fund from the recovered budget
};

/** Outcomes — aggregate, clinician-entered goal progress. Answers "are recovered
 *  (already-authorized) hours actually producing progress — not just getting billed?"
 *  AGGREGATE ONLY — never a single child. Infinite DISPLAYS clinician-entered progress;
 *  it never sets, recommends, or optimizes a child's hours. The BCBA owns the plan. */
export type OutcomeDomain = { domain: string; goalsTracked: number; onTrackPct: number; trend: "up" | "down" | "flat" };
export type OutcomeSetting = { setting: "In-home" | "Center" | "School"; goalsOnTrackPct: number; recoveredHoursShare: number };
export type Outcomes = {
  goalsOnTrackPct: number;        // clinic-wide % of active goals progressing (current period)
  status: Status;
  masteredThisPeriod: number;     // aggregate goals mastered this period
  weeklyProgress: { weekLabel: string; onTrackPct: number }[];
  recoveredVsProgress: { weekLabel: string; recoveredSessions: number; onTrackPct: number }[];
  byDomain: OutcomeDomain[];
  bySetting: OutcomeSetting[];
};

// ---- Hours & Utilization (operational hours; sourced from the suite today) ----
export type UtilizationSite = { site: string; authUtilPct: number; staffUtilPct: number; deliveredHours: number; authorizedHours: number; status: Status };
export type Utilization = {
  authUtilizationPct: number;   // clinic-wide delivered authorized ÷ total authorized
  staffUtilizationPct: number;  // clinic-wide billable ÷ available (healthy band ~85%)
  status: Status;
  authorizedHours: number;      // allotted this period
  scheduledHours: number;
  deliveredHours: number;       // rendered (includes recovered)
  lostHours: number;            // cancelled and NOT recovered
  recoveredHours: number;       // made up
  weekly: { weekLabel: string; authUtilPct: number; staffUtilPct: number }[];
  bySite: UtilizationSite[];
};

// ---- Finances (MVP source = manual/CSV entry; future = billing/clearinghouse integration) ----
export type ArBucket = { label: string; amount: number };
export type PayerSlice = { payer: string; sharePct: number };
export type FinanceSite = { site: string; revenuePerHour: number; collectedPct: number; status: Status };
export type Finances = {
  source: "manual" | "billing-integration"; // swap marker — manual today, integration later
  periodLabel: string;
  billed: number;
  collected: number;
  netCollectionRatePct: number;
  denialRatePct: number;
  firstPassAcceptancePct: number;
  daysInAR: number;
  daysToBill: number;
  revenuePerBillableHour: number;
  recoveredDollars: number;     // recovered-hours $ shown in context of collected
  arBuckets: ArBucket[];        // 0-30 / 31-60 / 61-90 / 90+
  payerMix: PayerSlice[];
  monthly: { monthLabel: string; billed: number; collected: number }[];
  bySite: FinanceSite[];
};

// ---- Adoption / proof-of-use (sourced from suite telemetry) ----
export type ModuleUsage = { module: string; usagePct: number; weeklyActive: number; trend: "up" | "down" | "flat" };
export type AdoptionSite = { site: string; adoptionPct: number; status: Status };
export type Adoption = {
  overallActivePct: number;     // % of licensed staff active this week
  status: Status;
  loginsThisPeriod: number;
  sessionsLoggedInApp: number;  // sessions documented through the app
  caregiverAppActivePct: number;// % of caregivers active in Care Pocket
  hoursTouchedBySystem: number; // hours that flowed through the suite this period
  weeklyActive: { weekLabel: string; pct: number }[];
  byModule: ModuleUsage[];      // which modules are used most
  bySite: AdoptionSite[];
};

export type OwnerRadarData = {
  clinicName: string;
  periodLabel: string;
  recoveryRate: number;
  sessionsAtRisk: number;
  sessionsRecovered: number;
  hoursRecovered: number;
  estimatedDollarsRecovered: number;
  // sparkline series for the headline metric cards (oldest → newest)
  metricSeries: {
    recoveryRate: number[];
    hoursRecovered: number[];
    estimatedDollarsRecovered: number[];
    sessionsAtRisk: number[];
  };
  weeklyTrend: WeeklyTrendPoint[];
  bySite: SiteRecovery[];
  bySetting: SettingRecovery[];
  byMethod: MethodBreakdown[];
  alerts: AlertItem[];
  staffPulse: StaffPulse;
  outcomes: Outcomes;
  utilization: Utilization;
  finances: Finances;
  adoption: Adoption;
};

const DEMO_CLINIC: OwnerRadarData = {
  clinicName: "North Star ABA",
  periodLabel: "Last 30 days",
  recoveryRate: 71,
  sessionsAtRisk: 142,
  sessionsRecovered: 101,
  hoursRecovered: 248,
  estimatedDollarsRecovered: 38400,
  metricSeries: {
    recoveryRate: [58, 61, 60, 64, 66, 69, 71],
    hoursRecovered: [22, 31, 44, 80, 130, 190, 248],
    estimatedDollarsRecovered: [3.4, 4.8, 6.8, 12.4, 20.1, 29.6, 38.4],
    sessionsAtRisk: [33, 38, 36, 35, 34, 33, 35]
  },
  weeklyTrend: [
    { weekLabel: "Wk 1", atRisk: 33, recovered: 21 },
    { weekLabel: "Wk 2", atRisk: 38, recovered: 27 },
    { weekLabel: "Wk 3", atRisk: 36, recovered: 26 },
    { weekLabel: "Wk 4", atRisk: 35, recovered: 27 }
  ],
  bySite: [
    { site: "North Center", setting: "Center", atRiskSessions: 52, recoveredSessions: 47, recoveryRate: 90, trend: "up" },
    { site: "In-home — East", setting: "In-home", atRiskSessions: 34, recoveredSessions: 26, recoveryRate: 76, trend: "up" },
    { site: "Lincoln School", setting: "School", atRiskSessions: 28, recoveredSessions: 18, recoveryRate: 64, trend: "down" },
    { site: "In-home — West", setting: "In-home", atRiskSessions: 30, recoveredSessions: 17, recoveryRate: 57, trend: "down" },
    { site: "South Center", setting: "Center", atRiskSessions: 25, recoveredSessions: 10, recoveryRate: 40, trend: "down" }
  ],
  bySetting: [
    { setting: "Center", atRiskSessions: 77, recoveredSessions: 57, recoveryRate: 74 },
    { setting: "In-home", atRiskSessions: 64, recoveredSessions: 43, recoveryRate: 67 },
    { setting: "School", atRiskSessions: 28, recoveredSessions: 18, recoveryRate: 64 }
  ],
  byMethod: [
    { method: "Makeup (in-person)", recoveredSessions: 44, share: 44 },
    { method: "Telehealth parent-training", recoveredSessions: 28, share: 28 },
    { method: "SubPool substitute", recoveredSessions: 19, share: 19 },
    { method: "Supported admin time", recoveredSessions: 10, share: 9 }
  ],
  alerts: [
    { severity: "high", title: "Recovery slipping at South Center", detail: "South Center recovery rate fell to 40% over the last 2 weeks — the lowest of any site. Worth a scheduler check-in." },
    { severity: "medium", title: "School-setting sessions harder to recover", detail: "Lincoln School sessions are recovering at 64% vs. a 71% clinic average — school-day constraints limit makeup windows." },
    { severity: "low", title: "Telehealth parent-training trending up", detail: "Telehealth recovery is up week over week — caregivers are accepting more parent-training makeups." }
  ],
  staffPulse: {
    clinicScore: 68,
    status: "amber",
    weeklyScores: [
      { weekLabel: "Wk 1", score: 58 },
      { weekLabel: "Wk 2", score: 61 },
      { weekLabel: "Wk 3", score: 65 },
      { weekLabel: "Wk 4", score: 68 }
    ],
    bySite: [
      { site: "North Center", score: 82, status: "green", trend: "up", staffCount: 14 },
      { site: "In-home — East", score: 74, status: "green", trend: "flat", staffCount: 9 },
      { site: "Lincoln School", score: 63, status: "amber", trend: "up", staffCount: 7 },
      { site: "In-home — West", score: 57, status: "amber", trend: "down", staffCount: 8 },
      { site: "South Center", score: 44, status: "red", trend: "down", staffCount: 11 }
    ],
    themes: [
      { label: "Schedule churn / last-minute changes", mentions: 18, sentiment: "concern" },
      { label: "Drive time between in-home visits", mentions: 12, sentiment: "concern" },
      { label: "Recognition for covering callouts", mentions: 9, sentiment: "concern" },
      { label: "SubPool bonus made coverage worth it", mentions: 15, sentiment: "positive" },
      { label: "Good supervision / BCBA support", mentions: 11, sentiment: "positive" }
    ],
    recoveredHoursBudget: 38400,
    interventions: [
      { title: "Raise SubPool coverage points 20%", detail: "South Center & In-home West are red and carry the most callouts. A temporary point bump makes covering open sessions worth more — funded by the hours those sessions recover.", estCost: 4200, lever: "SubPool incentive" },
      { title: "Quota bonus for hitting recovery target", detail: "Reward staff at red sites for meeting the weekly recovery quota. The recovered hours more than cover the bonus pool.", estCost: 6000, lever: "Bonus pool" },
      { title: "Restock materials & reinforcer kits", detail: "\u201cNeed better materials\u201d is a recurring concern theme. Refresh kits for the two red sites.", estCost: 2500, lever: "Materials" },
      { title: "Clinic appreciation event", detail: "A team event lifts morale broadly — most cost-effective when a site has climbed back toward green.", estCost: 1800, lever: "Recognition" }
    ]
  },
  outcomes: {
    goalsOnTrackPct: 76,
    status: "green",
    masteredThisPeriod: 34,
    weeklyProgress: [
      { weekLabel: "Wk 1", onTrackPct: 68 },
      { weekLabel: "Wk 2", onTrackPct: 70 },
      { weekLabel: "Wk 3", onTrackPct: 73 },
      { weekLabel: "Wk 4", onTrackPct: 76 }
    ],
    recoveredVsProgress: [
      { weekLabel: "Wk 1", recoveredSessions: 21, onTrackPct: 68 },
      { weekLabel: "Wk 2", recoveredSessions: 27, onTrackPct: 70 },
      { weekLabel: "Wk 3", recoveredSessions: 26, onTrackPct: 73 },
      { weekLabel: "Wk 4", recoveredSessions: 27, onTrackPct: 76 }
    ],
    byDomain: [
      { domain: "Functional communication", goalsTracked: 86, onTrackPct: 81, trend: "up" },
      { domain: "Daily living skills", goalsTracked: 64, onTrackPct: 74, trend: "up" },
      { domain: "Social skills", goalsTracked: 58, onTrackPct: 70, trend: "flat" },
      { domain: "Safety & behavior reduction", goalsTracked: 47, onTrackPct: 72, trend: "up" },
      { domain: "School readiness", goalsTracked: 39, onTrackPct: 66, trend: "down" }
    ],
    bySetting: [
      { setting: "Center", goalsOnTrackPct: 79, recoveredHoursShare: 47 },
      { setting: "In-home", goalsOnTrackPct: 73, recoveredHoursShare: 41 },
      { setting: "School", goalsOnTrackPct: 66, recoveredHoursShare: 12 }
    ]
  },
  utilization: {
    authUtilizationPct: 80,
    staffUtilizationPct: 83,
    status: "amber",
    authorizedHours: 5200,
    scheduledHours: 4600,
    deliveredHours: 4180,
    lostHours: 420,
    recoveredHours: 248,
    weekly: [
      { weekLabel: "Wk 1", authUtilPct: 74, staffUtilPct: 79 },
      { weekLabel: "Wk 2", authUtilPct: 76, staffUtilPct: 80 },
      { weekLabel: "Wk 3", authUtilPct: 78, staffUtilPct: 82 },
      { weekLabel: "Wk 4", authUtilPct: 80, staffUtilPct: 83 }
    ],
    bySite: [
      { site: "North Center", authUtilPct: 89, staffUtilPct: 86, deliveredHours: 1240, authorizedHours: 1393, status: "green" },
      { site: "In-home — East", authUtilPct: 82, staffUtilPct: 84, deliveredHours: 880, authorizedHours: 1073, status: "green" },
      { site: "Lincoln School", authUtilPct: 76, staffUtilPct: 81, deliveredHours: 690, authorizedHours: 908, status: "amber" },
      { site: "In-home — West", authUtilPct: 73, staffUtilPct: 80, deliveredHours: 720, authorizedHours: 986, status: "amber" },
      { site: "South Center", authUtilPct: 66, staffUtilPct: 78, deliveredHours: 650, authorizedHours: 985, status: "red" }
    ]
  },
  finances: {
    source: "manual",
    periodLabel: "Last 30 days",
    billed: 412000,
    collected: 372000,
    netCollectionRatePct: 90,
    denialRatePct: 7,
    firstPassAcceptancePct: 93,
    daysInAR: 38,
    daysToBill: 4,
    revenuePerBillableHour: 89,
    recoveredDollars: 38400,
    arBuckets: [
      { label: "0–30 days", amount: 84000 },
      { label: "31–60 days", amount: 38000 },
      { label: "61–90 days", amount: 19000 },
      { label: "90+ days", amount: 12000 }
    ],
    payerMix: [
      { payer: "Medicaid", sharePct: 54 },
      { payer: "Commercial", sharePct: 33 },
      { payer: "Other / private pay", sharePct: 13 }
    ],
    monthly: [
      { monthLabel: "Mar", billed: 351000, collected: 309000 },
      { monthLabel: "Apr", billed: 372000, collected: 332000 },
      { monthLabel: "May", billed: 398000, collected: 356000 },
      { monthLabel: "Jun", billed: 412000, collected: 372000 }
    ],
    bySite: [
      { site: "North Center", revenuePerHour: 94, collectedPct: 93, status: "green" },
      { site: "In-home — East", revenuePerHour: 88, collectedPct: 91, status: "green" },
      { site: "Lincoln School", revenuePerHour: 86, collectedPct: 88, status: "amber" },
      { site: "In-home — West", revenuePerHour: 87, collectedPct: 86, status: "amber" },
      { site: "South Center", revenuePerHour: 84, collectedPct: 82, status: "red" }
    ]
  },
  adoption: {
    overallActivePct: 86,
    status: "green",
    loginsThisPeriod: 4820,
    sessionsLoggedInApp: 3960,
    caregiverAppActivePct: 71,
    hoursTouchedBySystem: 4180,
    weeklyActive: [
      { weekLabel: "Wk 1", pct: 78 },
      { weekLabel: "Wk 2", pct: 81 },
      { weekLabel: "Wk 3", pct: 84 },
      { weekLabel: "Wk 4", pct: 86 }
    ],
    byModule: [
      { module: "Scheduler AI™", usagePct: 94, weeklyActive: 46, trend: "up" },
      { module: "FieldPocket™", usagePct: 88, weeklyActive: 43, trend: "up" },
      { module: "Care Pocket™ (caregiver)", usagePct: 71, weeklyActive: 132, trend: "up" },
      { module: "SubPool™", usagePct: 63, weeklyActive: 31, trend: "up" },
      { module: "Compliance Sentinel™", usagePct: 58, weeklyActive: 28, trend: "flat" },
      { module: "Auth Utilization War Room™", usagePct: 41, weeklyActive: 12, trend: "up" }
    ],
    bySite: [
      { site: "North Center", adoptionPct: 93, status: "green" },
      { site: "In-home — East", adoptionPct: 88, status: "green" },
      { site: "Lincoln School", adoptionPct: 81, status: "green" },
      { site: "In-home — West", adoptionPct: 76, status: "amber" },
      { site: "South Center", adoptionPct: 68, status: "amber" }
    ]
  }
};

const TENANTS: Record<string, OwnerRadarData> = { "demo-clinic": DEMO_CLINIC };

export function getOwnerRadarData(tenantId: string | undefined): OwnerRadarData {
  return TENANTS[tenantId ?? "demo-clinic"] ?? DEMO_CLINIC;
}
