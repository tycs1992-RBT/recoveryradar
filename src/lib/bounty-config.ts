// ===========================================================================
// BOUNTY CONFIG CONTRACT (website side)
//
// This MUST match the OS contract in the sandbox (src/lib/bountyEngine.js ->
// DEFAULT_BOUNTY_CONFIG). The owner command center edits and FUNDS this; the
// provider OS READS it. Keep the two shapes identical so they round-trip.
//
// FOR DANIEL: the saved config must round-trip OS <-> owner portal through the
// backend (shared per-tenant store). This file is the website half of that
// contract. Today the owner portal persists it to the site's own DB (real); the
// live push into the running OS is the seam you own (see /api/owner/bounty-config).
//
// HONESTY: points/dollars are an incentive abstraction. The owner FUNDS any real
// reward; a human approves every claim; nothing here pays anyone automatically.
// Proximity is NOT part of the value (the OS Map uses straight-line distance only
// to pick WHO to ping, never the amount).
// ===========================================================================

export const POINTS_PER_DOLLAR = 100;

export type RewardType = "giftcard" | "bonuspay";

export interface BountyTier {
  maxHours: number; // hours-until-start ceiling for this tier (use a large number for the base/open tier)
  dollars: number;
}

export interface BountyConfig {
  enabled: boolean;
  pointsPerDollar: number;
  rewardType: RewardType;
  pool: { funded: number };
  ladder: BountyTier[];
}

// Mirrors DEFAULT_BOUNTY_CONFIG in the OS. The OS uses Infinity for the base
// tier; JSON can't carry Infinity, so across the wire the base tier uses a large
// sentinel (BASE_TIER_HOURS) and both sides treat it as "everything beyond the
// last finite tier."
export const BASE_TIER_HOURS = 1_000_000;

export const DEFAULT_BOUNTY_CONFIG: BountyConfig = {
  enabled: true,
  pointsPerDollar: POINTS_PER_DOLLAR,
  rewardType: "giftcard",
  pool: { funded: 0 },
  ladder: [
    { maxHours: 4, dollars: 35 },
    { maxHours: 6, dollars: 30 },
    { maxHours: 12, dollars: 25 },
    { maxHours: 24, dollars: 20 },
    { maxHours: 36, dollars: 15 },
    { maxHours: 48, dollars: 10 },
    { maxHours: BASE_TIER_HOURS, dollars: 5 }, // base (> 48h out)
  ],
};

// Reward preview for the owner UI: given a config, what does a shift pay at each
// tier? Pure, no side effects, safe to run in the browser.
export function previewLadder(config: BountyConfig): { label: string; dollars: number; points: number }[] {
  if (!config.enabled) return [];
  const sorted = [...config.ladder].sort((a, b) => a.maxHours - b.maxHours);
  return sorted.map((tier, i) => {
    const isBase = tier.maxHours >= BASE_TIER_HOURS;
    const prev = i > 0 ? sorted[i - 1].maxHours : 0;
    const label = isBase
      ? `more than ${sorted[i - 1]?.maxHours ?? 48}h out`
      : i === 0
        ? `${tier.maxHours}h or less`
        : `${prev + 1}-${tier.maxHours}h out`;
    return { label, dollars: tier.dollars, points: tier.dollars * config.pointsPerDollar };
  });
}

// Guard against malformed input before persisting.
export function sanitizeConfig(input: Partial<BountyConfig> | null | undefined): BountyConfig {
  const base = DEFAULT_BOUNTY_CONFIG;
  if (!input || typeof input !== "object") return base;
  const ladder = Array.isArray(input.ladder) && input.ladder.length
    ? input.ladder
        .filter((t) => t && typeof t.maxHours === "number" && typeof t.dollars === "number")
        .map((t) => ({ maxHours: Math.max(0, t.maxHours), dollars: Math.max(0, Math.round(t.dollars)) }))
    : base.ladder;
  return {
    enabled: typeof input.enabled === "boolean" ? input.enabled : base.enabled,
    pointsPerDollar: typeof input.pointsPerDollar === "number" && input.pointsPerDollar > 0 ? input.pointsPerDollar : base.pointsPerDollar,
    rewardType: input.rewardType === "bonuspay" ? "bonuspay" : "giftcard",
    pool: { funded: Math.max(0, Math.round(input.pool?.funded ?? 0)) },
    ladder,
  };
}
