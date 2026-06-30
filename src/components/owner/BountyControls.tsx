"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  type BountyConfig,
  type BountyTier,
  BASE_TIER_HOURS,
  previewLadder,
  DEFAULT_BOUNTY_CONFIG,
} from "@/lib/bounty-config";

// Inline SVG icons. This site has no icon-library dependency; the other owner
// components draw inline SVGs the same way. Each icon takes a className for
// Tailwind sizing + color (stroke uses currentColor).
type IconProps = { className?: string };
const IconBase = ({ className, children }: { className?: string; children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);
const Power = ({ className }: IconProps) => <IconBase className={className}><path d="M12 2v10" /><path d="M18.4 6.6a9 9 0 1 1-12.8 0" /></IconBase>;
const Wallet = ({ className }: IconProps) => <IconBase className={className}><path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /><path d="M16 12a2 2 0 0 0 0 4h5v-4Z" /></IconBase>;
const Gift = ({ className }: IconProps) => <IconBase className={className}><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8" /><path d="M16.5 8a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8" /></IconBase>;
const Zap = ({ className }: IconProps) => <IconBase className={className}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></IconBase>;
const AlertCircle = ({ className }: IconProps) => <IconBase className={className}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></IconBase>;
const Check = ({ className }: IconProps) => <IconBase className={className}><polyline points="20 6 9 17 4 12" /></IconBase>;
const RotateCcw = ({ className }: IconProps) => <IconBase className={className}><path d="M3 2v6h6" /><path d="M3 8a9 9 0 1 0 2.6-5.6L3 8" /></IconBase>;
const Save = ({ className }: IconProps) => <IconBase className={className}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></IconBase>;

// The interactive control surface. Edits live in React state; Save PUTs to the
// real API (which persists to the site DB per tenant). The push into the running
// OS is Daniel's backend seam, surfaced honestly in the UI below.
export function BountyControls({ initialConfig }: { initialConfig: BountyConfig }) {
  const [config, setConfig] = useState<BountyConfig>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(() => previewLadder(config), [config]);

  const finiteTiers = config.ladder
    .filter((t) => t.maxHours < BASE_TIER_HOURS)
    .sort((a, b) => a.maxHours - b.maxHours);
  const baseTier = config.ladder.find((t) => t.maxHours >= BASE_TIER_HOURS);

  const setTierDollars = (maxHours: number, dollars: number) =>
    setConfig((c) => ({
      ...c,
      ladder: c.ladder.map((t) => (t.maxHours === maxHours ? { ...t, dollars: Math.max(0, dollars) } : t)),
    }));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/owner/bounty-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Save failed");
      setSavedAt(new Date().toLocaleTimeString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setConfig(DEFAULT_BOUNTY_CONFIG);
    setSavedAt(null);
  };

  const committedNote = config.pool.funded > 0
    ? `Budget set to $${config.pool.funded.toLocaleString()}. Committed and remaining are derived from real claims once the OS is wired.`
    : "No incentive budget funded yet. The system stays off until you fund a pool and enable it.";

  return (
    <div className="space-y-6">
      {/* Master switch */}
      <Panel>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Power className={config.enabled ? "h-5 w-5 text-emerald-400" : "h-5 w-5 text-slate-500"} />
              <h2 className="text-lg font-black text-white">Incentive system</h2>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-400">
              {config.enabled
                ? "On. Recovery shifts can carry a funded bounty that climbs as the start time approaches."
                : "Off. No bounties are offered. Shifts still route to the nearest available staffer; there is just no incentive attached."}
            </p>
          </div>
          <button
            onClick={() => setConfig((c) => ({ ...c, enabled: !c.enabled }))}
            className={`relative h-8 w-14 shrink-0 rounded-full transition ${config.enabled ? "bg-emerald-500" : "bg-slate-600"}`}
            aria-pressed={config.enabled}
          >
            <span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${config.enabled ? "left-7" : "left-1"}`} />
          </button>
        </div>
      </Panel>

      {/* Funding + reward type */}
      <Panel>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="flex items-center gap-2 text-sm font-black text-white">
              <Wallet className="h-4 w-4 text-cyan-400" /> Funded incentive pool
            </label>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-2xl font-black text-slate-400">$</span>
              <input
                type="number"
                min={0}
                step={50}
                value={config.pool.funded}
                onChange={(e) => setConfig((c) => ({ ...c, pool: { funded: Math.max(0, Number(e.target.value) || 0) } }))}
                className="w-40 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xl font-black text-white outline-none focus:border-cyan-400"
              />
            </div>
            <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{committedNote}</p>
          </div>

          <div>
            <span className="flex items-center gap-2 text-sm font-black text-white">
              <Gift className="h-4 w-4 text-amber-300" /> How rewards are paid
            </span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["giftcard", "bonuspay"] as const).map((rt) => (
                <button
                  key={rt}
                  onClick={() => setConfig((c) => ({ ...c, rewardType: rt }))}
                  className={`rounded-xl border px-3 py-3 text-left text-sm font-bold transition ${
                    config.rewardType === rt
                      ? "border-amber-300/50 bg-amber-300/10 text-amber-100"
                      : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
                  }`}
                >
                  {rt === "giftcard" ? "Gift card" : "Bonus pay"}
                  <span className="mt-0.5 block text-[11px] font-semibold text-slate-500">
                    {rt === "giftcard" ? "Issued as a gift card" : "Added to payroll as a bonus"}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
              You fund and approve every reward. Nothing pays out automatically.
            </p>
          </div>
        </div>
      </Panel>

      {/* The ladder */}
      <Panel>
        <div className="mb-3 flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-300" />
          <h2 className="text-lg font-black text-white">The reward ladder</h2>
        </div>
        <p className="mb-4 text-sm font-semibold leading-6 text-slate-400">
          The reward is set by how long until the session starts, and climbs on its own as the clock runs down.
          Edit any amount. Points are dollars times {config.pointsPerDollar}.
        </p>
        <div className="space-y-2">
          {finiteTiers.map((tier) => (
            <TierRow key={tier.maxHours} tier={tier} ppd={config.pointsPerDollar} onChange={(d) => setTierDollars(tier.maxHours, d)} disabled={!config.enabled} />
          ))}
          {baseTier && (
            <TierRow
              tier={baseTier}
              ppd={config.pointsPerDollar}
              onChange={(d) => setTierDollars(baseTier.maxHours, d)}
              disabled={!config.enabled}
              baseLabel={`more than ${finiteTiers[finiteTiers.length - 1]?.maxHours ?? 48}h out (base)`}
            />
          )}
        </div>
        {!config.enabled && (
          <p className="mt-3 text-xs font-bold text-slate-500">Turn the system on to offer these rewards.</p>
        )}
      </Panel>

      {/* Save bar */}
      <div className="sticky bottom-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 backdrop-blur">
        <div className="text-xs font-semibold text-slate-400">
          {error ? (
            <span className="inline-flex items-center gap-1 text-rose-300"><AlertCircle className="h-3.5 w-3.5" /> {error}</span>
          ) : savedAt ? (
            <span className="inline-flex items-center gap-1 text-emerald-300"><Check className="h-3.5 w-3.5" /> Saved at {savedAt}. The running OS picks this up once the sync backend is connected.</span>
          ) : (
            "Changes are not saved until you click Save."
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm font-bold text-slate-300 hover:bg-white/[0.06]">
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-black text-slate-950 hover:bg-emerald-400 disabled:opacity-60">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Live preview */}
      {config.enabled && preview.length > 0 && (
        <Panel>
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-400">What a shift will pay</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {preview.map((p) => (
              <div key={p.label} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{p.label}</p>
                <p className="text-lg font-black text-amber-200">${p.dollars} <span className="text-xs font-bold text-slate-500">/ {p.points} pts</span></p>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

function TierRow({ tier, ppd, onChange, disabled, baseLabel }: { tier: BountyTier; ppd: number; onChange: (d: number) => void; disabled?: boolean; baseLabel?: string }) {
  return (
    <div className={`flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 ${disabled ? "opacity-50" : ""}`}>
      <span className="text-sm font-bold text-slate-200">{baseLabel ?? `${tier.maxHours}h or less`}</span>
      <div className="flex items-center gap-2">
        <span className="font-black text-slate-400">$</span>
        <input
          type="number"
          min={0}
          step={5}
          disabled={disabled}
          value={tier.dollars}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-20 rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1.5 text-right font-black text-white outline-none focus:border-amber-300 disabled:cursor-not-allowed"
        />
        <span className="w-20 text-right text-xs font-bold text-slate-500">{(tier.dollars * ppd).toLocaleString()} pts</span>
      </div>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">{children}</div>;
}
