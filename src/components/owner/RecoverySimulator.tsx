"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

/**
 * Recovery Simulator — an illustrative ROI model shown in two places:
 *   - the owner portal (variant="owner"): a clinic owner plugs in THEIR numbers and watches
 *     recovery compound over time. Seed from the tenant's real account data via `initialInputs`
 *     (Daniel's pipe); falls back to the industry demo seed for the demo clinic.
 *   - the public marketing site (variant="public"): a prospect drives the numbers to see what a
 *     recovery layer is worth before they buy.
 *
 * Honest by construction: recovered-dollar math uses published ABA industry averages; the
 * retention effect is a labeled, adjustable HYPOTHESIS (slider goes to zero). No chart library
 * (hand-rolled SVG), no storage, no network — pure client component.
 */

type Setting = "clinic" | "hybrid" | "home";

export type SimInputs = {
  clients: number;
  hoursPerClient: number;
  cancellationPct: number;
  recoveryPct: number;
  ratePerHour: number;
  rbtCount: number;
  turnoverPct: number;
  retentionLiftPct: number;
  platformCost: number;
};

type HistoryPoint = { month: number; cumRecovered: number; cumCost: number; rbt: number };

const NAVY = "#070b18";
const PANEL = "#0e1530";
const PANEL_2 = "#121b3a";
const LINE = "#1e2a52";
const CYAN = "#22d3ee";
const EMER = "#34d399";
const AMBER = "#fbbf24";
const ROSE = "#fb7185";
const MUTE = "#8595c0";

const WEEKS_PER_MONTH = 4.345;
const HORIZON = 36;

// Industry-average starting points by delivery setting. Illustrative, not a quote.
const SETTINGS: Record<Setting, { label: string; cancellation: number; hoursPerClient: number }> = {
  clinic: { label: "In-clinic", cancellation: 25, hoursPerClient: 18 },
  hybrid: { label: "Hybrid", cancellation: 30, hoursPerClient: 15 },
  home: { label: "In-home", cancellation: 33, hoursPerClient: 12 }
};

function demoSeed(setting: Setting = "hybrid"): SimInputs {
  const s = SETTINGS[setting];
  return {
    clients: 68,
    hoursPerClient: s.hoursPerClient,
    cancellationPct: s.cancellation,
    recoveryPct: 33,
    ratePerHour: 88,
    rbtCount: 24,
    turnoverPct: 90,
    retentionLiftPct: 30,
    platformCost: 1500
  };
}

const ZEROED: SimInputs = {
  clients: 0, hoursPerClient: 0, cancellationPct: 0, recoveryPct: 0,
  ratePerHour: 0, rbtCount: 0, turnoverPct: 0, retentionLiftPct: 0, platformCost: 0
};

const fmtMoney = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M`
  : n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`
  : `$${Math.round(n)}`;

export function RecoverySimulator({
  variant = "public",
  initialInputs,
  initialSetting = "hybrid",
  locked = false
}: {
  variant?: "owner" | "public";
  initialInputs?: Partial<SimInputs>;
  initialSetting?: Setting;
  /** Proof mode for the public page: locks to the average hybrid clinic on industry numbers,
   *  hides every control, and auto-plays the curve ONCE when scrolled into view, then settles. */
  locked?: boolean;
}) {
  const [setting, setSetting] = useState<Setting>(locked ? "hybrid" : initialSetting);
  const [inp, setInp] = useState<SimInputs>(() =>
    locked ? demoSeed("hybrid") : { ...demoSeed(initialSetting), ...initialInputs }
  );
  const [month, setMonth] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 3 | 12>(locked ? 12 : 3);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const autoPlayedRef = useRef(false);

  const perMonth = useMemo(() => {
    const weeklyAuthHours = inp.clients * inp.hoursPerClient;
    const weeklyCancelled = weeklyAuthHours * (inp.cancellationPct / 100);
    const weeklyRecovered = weeklyCancelled * (inp.recoveryPct / 100);
    const recoveredHours = weeklyRecovered * WEEKS_PER_MONTH;
    const recoveredDollars = recoveredHours * inp.ratePerHour;
    const baselineQuits = (inp.rbtCount * (inp.turnoverPct / 100)) / 12;
    const preventedQuits = baselineQuits * (inp.retentionLiftPct / 100);
    const netQuits = baselineQuits - preventedQuits;
    return { weeklyAuthHours, recoveredHours, recoveredDollars, baselineQuits, preventedQuits, netQuits };
  }, [inp]);

  const step = useCallback(() => {
    setHistory((h) => {
      if (h.length >= HORIZON + 1) return h;
      const prev = h[h.length - 1] || { month: 0, cumRecovered: 0, cumCost: 0, rbt: inp.rbtCount };
      const m = prev.month + 1;
      const cumRecovered = prev.cumRecovered + perMonth.recoveredDollars;
      const cumCost = prev.cumCost + inp.platformCost;
      const lost = perMonth.netQuits;
      const rbt = Math.max(0, prev.rbt - lost + lost * 0.8);
      setMonth(m);
      return [...h, { month: m, cumRecovered, cumCost, rbt }];
    });
  }, [perMonth, inp.rbtCount, inp.platformCost]);

  useEffect(() => {
    if (history.length === 0) {
      setHistory([{ month: 0, cumRecovered: 0, cumCost: 0, rbt: inp.rbtCount }]);
    }
  }, [history.length, inp.rbtCount]);

  useEffect(() => {
    if (!playing) { if (timer.current) clearInterval(timer.current); return; }
    const ms = speed === 12 ? 110 : speed === 3 ? 320 : 700;
    timer.current = setInterval(() => {
      setHistory((h) => { if (h.length >= HORIZON + 1) { setPlaying(false); } return h; });
      step();
    }, ms);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [playing, speed, step]);

  // Proof mode: run the curve ONCE when it scrolls into view, then let it settle on month 36.
  useEffect(() => {
    if (!locked) return;
    const el = rootRef.current;
    const start = () => {
      if (autoPlayedRef.current) return;
      autoPlayedRef.current = true;
      setSpeed(12);
      setPlaying(true);
    };
    if (!el || typeof IntersectionObserver === "undefined") {
      const t = setTimeout(start, 400); // fallback: just play shortly after mount
      return () => clearTimeout(t);
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) start(); });
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [locked]);

  const reset = () => {
    setPlaying(false); setMonth(0);
    setHistory([{ month: 0, cumRecovered: 0, cumCost: 0, rbt: inp.rbtCount }]);
  };
  const applySetting = (key: Setting) => {
    setSetting(key);
    setInp((cur) => ({ ...cur, cancellationPct: SETTINGS[key].cancellation, hoursPerClient: SETTINGS[key].hoursPerClient }));
    setPlaying(false); setMonth(0);
    setHistory([{ month: 0, cumRecovered: 0, cumCost: 0, rbt: inp.rbtCount }]);
  };
  const loadDemo = () => {
    const d = demoSeed(setting);
    setInp(d); setPlaying(false); setMonth(0);
    setHistory([{ month: 0, cumRecovered: 0, cumCost: 0, rbt: d.rbtCount }]);
  };
  const clearForLive = () => {
    setInp({ ...ZEROED }); setPlaying(false); setMonth(0);
    setHistory([{ month: 0, cumRecovered: 0, cumCost: 0, rbt: 0 }]);
  };

  const last = history[history.length - 1] || { cumRecovered: 0, cumCost: 0, rbt: inp.rbtCount };
  const net = last.cumRecovered - last.cumCost;
  const breakeven = useMemo(() => {
    const hit = history.find((p) => p.cumRecovered >= p.cumCost && p.month > 0);
    return hit ? hit.month : null;
  }, [history]);
  const isLive = inp.clients === 0 && inp.rbtCount === 0;

  const setField = (k: keyof SimInputs) => (x: number) => setInp({ ...inp, [k]: x });

  // Proof headline: the projected 3-year recovered total for this (locked) average clinic.
  const threeYearRecovered = perMonth.recoveredDollars * HORIZON;

  return (
    <div ref={rootRef} style={{ background: NAVY, color: "#eaf0ff", borderRadius: 24, padding: "20px 18px", fontFamily: "inherit" }}>
      {/* header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 21, fontWeight: 900, letterSpacing: "-0.02em", margin: 0, color: "#fff" }}>Recovery Simulator</h2>
            <span style={badge(AMBER)}>Illustrative · industry rates</span>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 12.5, color: MUTE, maxWidth: 640 }}>
            {locked
              ? "What a recovery layer returns for a typical hybrid ABA clinic, on published industry averages. Your clinic's actual recovery is tracked live inside Recovery Radar."
              : variant === "owner"
              ? "Plug in your clinic's real numbers and run time forward to project recovered hours. Drag any input — the curve bends as you go."
              : "See what a recovery layer is worth. Drag in your clinic's numbers and run the months forward — recovered hours compound past the platform cost."}
          </p>
        </div>
        {!locked && (
        <div style={{ display: "flex", gap: 6, background: PANEL, border: `1px solid ${LINE}`, borderRadius: 10, padding: 4 }}>
          {(Object.keys(SETTINGS) as Setting[]).map((key) => {
            const active = setting === key;
            return (
              <button key={key} onClick={() => applySetting(key)} type="button"
                style={{ fontSize: 11.5, fontWeight: 800, color: active ? NAVY : MUTE, background: active ? CYAN : "transparent", border: "none", borderRadius: 7, padding: "7px 11px", cursor: "pointer" }}>
                {SETTINGS[key].label}
              </button>
            );
          })}
        </div>
        )}
      </div>

      {/* proof headline (locked mode only) */}
      {locked && (
        <div style={{ background: `linear-gradient(90deg, ${EMER}1f, transparent)`, border: `1px solid ${EMER}33`, borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#bfe9d4", fontWeight: 700 }}>A typical ~{inp.clients}-client hybrid clinic recovers about</p>
          <p style={{ margin: "4px 0 0", fontSize: 34, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
            {fmtMoney(threeYearRecovered)} <span style={{ fontSize: 15, fontWeight: 700, color: MUTE }}>recovered over 3 years</span>
          </p>
        </div>
      )}

      {/* time control */}
      {!locked && (
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, background: PANEL, border: `1px solid ${LINE}`, borderRadius: 12, padding: "11px 13px", marginBottom: 14 }}>
        <button onClick={() => setPlaying((p) => !p)} disabled={isLive || month >= HORIZON} type="button"
          style={{ fontWeight: 900, fontSize: 13, color: NAVY, background: playing ? AMBER : EMER, border: "none", borderRadius: 8, padding: "9px 16px", cursor: isLive ? "not-allowed" : "pointer", opacity: isLive ? 0.4 : 1 }}>
          {playing ? "❚❚ Pause" : month >= HORIZON ? "Done" : "▶ Run time"}
        </button>
        <div style={{ display: "flex", gap: 3, background: PANEL_2, borderRadius: 8, padding: 3 }}>
          {([1, 3, 12] as const).map((s) => (
            <button key={s} onClick={() => setSpeed(s)} type="button"
              style={{ fontSize: 11, fontWeight: 800, color: speed === s ? NAVY : MUTE, background: speed === s ? CYAN : "transparent", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer" }}>
              {s}×
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginLeft: 4 }}>
          <span style={{ fontSize: 11, color: MUTE, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>Month</span>
          <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", fontVariantNumeric: "tabular-nums", minWidth: 30 }}>{month}</span>
          <span style={{ fontSize: 11, color: MUTE }}>/ {HORIZON}</span>
        </div>
        <div style={{ flex: 1, minWidth: 110, height: 6, background: PANEL_2, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ width: `${(month / HORIZON) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${CYAN}, ${EMER})`, transition: "width 0.2s" }} />
        </div>
        <button onClick={reset} type="button" style={ctrlBtn}>↺ Reset</button>
        <button onClick={loadDemo} type="button" style={ctrlBtn}>Demo clinic</button>
        <button onClick={clearForLive} type="button" style={{ ...ctrlBtn, color: ROSE, borderColor: `${ROSE}55` }}>Clear for live data</button>
      </div>
      )}

      {!locked && isLive && (
        <div style={{ background: `${ROSE}14`, border: `1px solid ${ROSE}44`, borderRadius: 10, padding: "12px 14px", marginBottom: 14, fontSize: 12.5, color: "#ffd9df" }}>
          {variant === "owner"
            ? "Cleared. Enter your clinic's real client count, staffing, and rates above — or these fields will fill from your account once your data is connected."
            : "Cleared to zero. Type in your own clinic's numbers above, or hit Demo clinic to reload the sample."}
        </div>
      )}

      {/* metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 14 }}>
        <Metric color={CYAN} label="Recovered / month" value={fmtMoney(perMonth.recoveredDollars)} sub={`${Math.round(perMonth.recoveredHours)} hrs recovered`} />
        <Metric color={EMER} label="Recovered to date" value={fmtMoney(last.cumRecovered)} sub={`over ${month} month${month === 1 ? "" : "s"}`} />
        <Metric color={net >= 0 ? EMER : ROSE} label="Net ROI to date" value={`${net >= 0 ? "" : "−"}${fmtMoney(Math.abs(net))}`} sub={`after ${fmtMoney(last.cumCost)} platform cost`} />
        <Metric color={AMBER} label="Break-even" value={breakeven ? `Month ${breakeven}` : month >= HORIZON ? "—" : "…"} sub={breakeven ? "recovery > cost" : "keep running time"} />
      </div>

      {/* charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12, marginBottom: 14 }} className="rs-charts">
        <ChartPanel title="Recovered dollars vs. platform cost" badgeText="grounded in industry rates" badgeColor={EMER}>
          <RoiChart history={history} />
          <Legend items={[{ c: EMER, t: "Cumulative recovered" }, { c: ROSE, t: "Cumulative platform cost" }]} />
        </ChartPanel>
        <ChartPanel title="RBT headcount over time" badgeText="hypothesis — not measured" badgeColor={AMBER}>
          <StaffChart history={history} seed={inp.rbtCount} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: MUTE, marginTop: 8, flexWrap: "wrap", gap: 6 }}>
            <span>Baseline quits/mo: <strong style={{ color: ROSE }}>{perMonth.baselineQuits.toFixed(1)}</strong></span>
            <span>With recovery: <strong style={{ color: EMER }}>{perMonth.netQuits.toFixed(1)}</strong></span>
            <span>Prevented: <strong style={{ color: CYAN }}>{perMonth.preventedQuits.toFixed(1)}</strong></span>
          </div>
        </ChartPanel>
      </div>

      {/* sliders */}
      {!locked && (
      <ChartPanel title={variant === "owner" ? "Your clinic's inputs" : "Inputs — drag to your clinic's reality"}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px 26px", marginTop: 6 }}>
          <Slider label="Active clients" v={inp.clients} set={setField("clients")} min={0} max={200} unit="" />
          <Slider label="Billable hrs / client / week" v={inp.hoursPerClient} set={setField("hoursPerClient")} min={0} max={40} unit="h" />
          <Slider label="Cancellation rate" v={inp.cancellationPct} set={setField("cancellationPct")} min={0} max={50} unit="%" accent={ROSE} />
          <Slider label="Recovery rate (platform)" v={inp.recoveryPct} set={setField("recoveryPct")} min={0} max={100} unit="%" accent={CYAN} />
          <Slider label="Collected rate / hour" v={inp.ratePerHour} set={setField("ratePerHour")} min={0} max={150} unit="$" prefix />
          <Slider label="RBTs on staff" v={inp.rbtCount} set={setField("rbtCount")} min={0} max={80} unit="" />
          <Slider label="Annual RBT turnover" v={inp.turnoverPct} set={setField("turnoverPct")} min={0} max={120} unit="%" accent={ROSE} />
          <Slider label="Retention lift from recovery" v={inp.retentionLiftPct} set={setField("retentionLiftPct")} min={0} max={60} unit="%" accent={AMBER} hint />
          <Slider label="Platform cost / month" v={inp.platformCost} set={setField("platformCost")} min={0} max={10000} step={100} unit="$" prefix />
        </div>
      </ChartPanel>
      )}

      {/* disclaimer */}
      <div style={{ marginTop: 14, padding: "13px 15px", background: PANEL, border: `1px solid ${LINE}`, borderRadius: 12 }}>
        <p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.65, color: MUTE }}>
          <strong style={{ color: "#cdd8ff" }}>This is a planning model, not a guarantee.</strong> Recovered-dollar figures use published ABA industry averages (≈30% cancellation, ≈$88/collected hour in-network, 77–104% annual RBT turnover) as starting points — replace them with your own numbers. The link between recovering sessions and lower RBT turnover is a reasonable <em>hypothesis</em>, not a measured outcome; the &ldquo;retention lift&rdquo; slider is yours to set, including to zero. Use clinic-level numbers only — no PHI. Figures are illustrative until validated against your clinic&apos;s actual payer rates and history.
        </p>
      </div>

      <style>{`
        .rs-slider::-webkit-slider-thumb{ -webkit-appearance:none; width:15px; height:15px; border-radius:50%; background:#fff; cursor:pointer; }
        .rs-slider::-moz-range-thumb{ width:13px; height:13px; border-radius:50%; background:#fff; border:none; cursor:pointer; }
        @media (max-width: 760px){ .rs-charts{ grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

function badge(color: string): React.CSSProperties {
  return { fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.16em", color, border: `1px solid ${color}55`, background: `${color}14`, padding: "3px 7px", borderRadius: 5 };
}
const ctrlBtn: React.CSSProperties = { fontSize: 11.5, fontWeight: 800, color: MUTE, background: "transparent", border: `1px solid ${LINE}`, borderRadius: 8, padding: "8px 11px", cursor: "pointer" };

function Metric({ color, label, value, sub }: { color: string; label: string; value: string; sub: string }) {
  return (
    <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 12, padding: "14px 15px", position: "relative", overflow: "hidden" }}>
      <span style={{ position: "absolute", top: 0, left: 0, height: "100%", width: 3, background: color }} />
      <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.13em", color: MUTE }}>{label}</span>
      <div style={{ fontSize: 27, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", marginTop: 6 }}>{value}</div>
      <div style={{ fontSize: 11, color: MUTE, marginTop: 3 }}>{sub}</div>
    </div>
  );
}

function ChartPanel({ title, badgeText, badgeColor, children }: { title: string; badgeText?: string; badgeColor?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 14, padding: "15px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 10 }}>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: "#dbe4ff", margin: 0 }}>{title}</h3>
        {badgeText && badgeColor && <span style={{ ...badge(badgeColor), whiteSpace: "nowrap" }}>{badgeText}</span>}
      </div>
      {children}
    </div>
  );
}

function Legend({ items }: { items: { c: string; t: string }[] }) {
  return (
    <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
      {items.map((it) => (
        <div key={it.t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: MUTE }}>
          <span style={{ width: 11, height: 3, borderRadius: 2, background: it.c }} /> {it.t}
        </div>
      ))}
    </div>
  );
}

function Slider({ label, v, set, min, max, step = 1, unit, prefix, accent = CYAN, hint }: {
  label: string; v: number; set: (x: number) => void; min: number; max: number; step?: number; unit: string; prefix?: boolean; accent?: string; hint?: boolean;
}) {
  const pct = ((v - min) / (max - min)) * 100;
  const display = prefix ? `${unit}${v.toLocaleString()}` : `${v}${unit}`;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#c3cdf0" }}>
          {label}{hint && <span style={{ marginLeft: 5, fontSize: 9, color: AMBER, border: `1px solid ${AMBER}55`, borderRadius: 4, padding: "1px 4px" }}>hyp</span>}
        </span>
        <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => set(Number(e.target.value))} className="rs-slider"
        style={{ width: "100%", height: 5, borderRadius: 4, appearance: "none", WebkitAppearance: "none", cursor: "pointer", outline: "none", accentColor: accent, background: `linear-gradient(90deg, ${accent} ${pct}%, ${PANEL_2} ${pct}%)` }} />
    </div>
  );
}

/* ---------- hand-rolled SVG charts ---------- */

function geom(history: HistoryPoint[], maxY: number, W: number, H: number, pad: { t: number; r: number; b: number; l: number }) {
  const x = (m: number) => pad.l + (m / HORIZON) * (W - pad.l - pad.r);
  const y = (val: number) => H - pad.b - (maxY <= 0 ? 0 : (val / maxY) * (H - pad.t - pad.b));
  const path = (key: "cumRecovered" | "cumCost" | "rbt") =>
    history.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.month).toFixed(1)} ${y(p[key]).toFixed(1)}`).join(" ");
  const area = (key: "cumRecovered" | "rbt") =>
    history.length < 2 ? "" : `${path(key)} L ${x(history[history.length - 1].month).toFixed(1)} ${H - pad.b} L ${x(0).toFixed(1)} ${H - pad.b} Z`;
  return { x, y, path, area };
}

function RoiChart({ history }: { history: HistoryPoint[] }) {
  const W = 560, H = 240, pad = { t: 14, r: 16, b: 26, l: 52 };
  const maxY = Math.max(1000, ...history.map((p) => Math.max(p.cumRecovered, p.cumCost))) * 1.1;
  const g = geom(history, maxY, W, H, pad);
  const lastP = history[history.length - 1];
  const crossed = lastP && lastP.cumRecovered >= lastP.cumCost && lastP.month > 0;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
        const t = f * maxY;
        return (
          <g key={i}>
            <line x1={pad.l} y1={g.y(t)} x2={W - pad.r} y2={g.y(t)} stroke={LINE} strokeWidth="1" strokeDasharray="2 4" />
            <text x={pad.l - 8} y={g.y(t) + 3} textAnchor="end" fill={MUTE} fontSize="9">{fmtMoney(t)}</text>
          </g>
        );
      })}
      <defs>
        <linearGradient id="rsRecGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={EMER} stopOpacity="0.30" />
          <stop offset="100%" stopColor={EMER} stopOpacity="0" />
        </linearGradient>
      </defs>
      {history.length >= 2 && <path d={g.area("cumRecovered")} fill="url(#rsRecGrad)" />}
      {history.length >= 2 && <path d={g.path("cumCost")} fill="none" stroke={ROSE} strokeWidth="2" strokeDasharray="5 4" />}
      {history.length >= 2 && <path d={g.path("cumRecovered")} fill="none" stroke={EMER} strokeWidth="2.5" />}
      {lastP && history.length >= 2 && <circle cx={g.x(lastP.month)} cy={g.y(lastP.cumRecovered)} r="4" fill={EMER} stroke={NAVY} strokeWidth="2" />}
      {[0, 6, 12, 18, 24, 30, 36].map((m) => (
        <text key={m} x={g.x(m)} y={H - 8} textAnchor="middle" fill={MUTE} fontSize="9">{m}</text>
      ))}
      {crossed && <text x={W - pad.r} y={pad.t + 6} textAnchor="end" fill={EMER} fontSize="10" fontWeight="700">recovery &gt; cost ✓</text>}
    </svg>
  );
}

function StaffChart({ history, seed }: { history: HistoryPoint[]; seed: number }) {
  const W = 360, H = 240, pad = { t: 14, r: 14, b: 26, l: 34 };
  const maxY = Math.max(seed, ...history.map((p) => p.rbt), 1) * 1.15;
  const g = geom(history, maxY, W, H, pad);
  const lastP = history[history.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {[0, 0.5, 1].map((f, i) => {
        const t = f * maxY;
        return (
          <g key={i}>
            <line x1={pad.l} y1={g.y(t)} x2={W - pad.r} y2={g.y(t)} stroke={LINE} strokeWidth="1" strokeDasharray="2 4" />
            <text x={pad.l - 7} y={g.y(t) + 3} textAnchor="end" fill={MUTE} fontSize="9">{Math.round(t)}</text>
          </g>
        );
      })}
      <line x1={pad.l} y1={g.y(seed)} x2={W - pad.r} y2={g.y(seed)} stroke={MUTE} strokeWidth="1" strokeDasharray="1 5" opacity="0.5" />
      <defs>
        <linearGradient id="rsStaffGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={CYAN} stopOpacity="0.28" />
          <stop offset="100%" stopColor={CYAN} stopOpacity="0" />
        </linearGradient>
      </defs>
      {history.length >= 2 && <path d={g.area("rbt")} fill="url(#rsStaffGrad)" />}
      {history.length >= 2 && <path d={g.path("rbt")} fill="none" stroke={CYAN} strokeWidth="2.5" />}
      {lastP && history.length >= 2 && <circle cx={g.x(lastP.month)} cy={g.y(lastP.rbt)} r="4" fill={CYAN} stroke={NAVY} strokeWidth="2" />}
      {[0, 12, 24, 36].map((m) => (
        <text key={m} x={g.x(m)} y={H - 8} textAnchor="middle" fill={MUTE} fontSize="9">{m}</text>
      ))}
    </svg>
  );
}
