import type { ReactNode } from "react";

/**
 * Recovery Radar command-center UI kit.
 * Dark, glassy, glowing — deep navy with cyan/violet accents. All charts are hand-rolled
 * inline SVG (no chart dependency). Pure presentational components, server-render safe.
 */

const TONE = {
  cyan: { stroke: "#22d3ee", fill: "rgba(34,211,238,0.18)", text: "text-cyan-300", glow: "shadow-[0_0_40px_-12px_rgba(34,211,238,0.6)]", ring: "ring-cyan-400/30" },
  violet: { stroke: "#a78bfa", fill: "rgba(167,139,250,0.18)", text: "text-violet-300", glow: "shadow-[0_0_40px_-12px_rgba(167,139,250,0.6)]", ring: "ring-violet-400/30" },
  emerald: { stroke: "#34d399", fill: "rgba(52,211,153,0.18)", text: "text-emerald-300", glow: "shadow-[0_0_40px_-12px_rgba(52,211,153,0.55)]", ring: "ring-emerald-400/30" },
  amber: { stroke: "#fbbf24", fill: "rgba(251,191,36,0.16)", text: "text-amber-300", glow: "shadow-[0_0_40px_-12px_rgba(251,191,36,0.5)]", ring: "ring-amber-400/30" },
  rose: { stroke: "#fb7185", fill: "rgba(251,113,133,0.16)", text: "text-rose-300", glow: "shadow-[0_0_40px_-12px_rgba(251,113,133,0.5)]", ring: "ring-rose-400/30" }
} as const;
export type Tone = keyof typeof TONE;

export const statusTone: Record<"green" | "amber" | "red", Tone> = { green: "emerald", amber: "amber", red: "rose" };

/** Glassy panel wrapper. */
export function Panel({ children, className = "", title, eyebrow, action }: { children: ReactNode; className?: string; title?: string; eyebrow?: string; action?: ReactNode }) {
  return (
    <section className={`rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm ${className}`}>
      {(title || eyebrow || action) && (
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            {eyebrow ? <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">{eyebrow}</p> : null}
            {title ? <h2 className="mt-1 text-lg font-black text-slate-100">{title}</h2> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Headline metric card with sparkline + delta. */
export function MetricCard({ label, value, sub, series, tone = "cyan", invertDelta = false }: { label: string; value: string; sub?: string; series: number[]; tone?: Tone; invertDelta?: boolean }) {
  const first = series[0] ?? 0;
  const last = series[series.length - 1] ?? 0;
  const pct = first === 0 ? 0 : Math.round(((last - first) / Math.abs(first)) * 100);
  const improving = invertDelta ? pct < 0 : pct > 0;
  const t = TONE[tone];
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-5 ${t.glow}`}>
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-4xl font-black leading-none text-white">{value}</p>
        <Sparkline series={series} tone={tone} />
      </div>
      <div className="mt-3 flex items-center gap-2">
        {pct !== 0 && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-black ${improving ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}>
            {improving ? "▲" : "▼"} {Math.abs(pct)}%
          </span>
        )}
        {sub ? <span className="text-[11px] font-semibold text-slate-400">{sub}</span> : null}
      </div>
    </div>
  );
}

/** Tiny inline sparkline. */
export function Sparkline({ series, tone = "cyan", w = 96, h = 34 }: { series: number[]; tone?: Tone; w?: number; h?: number }) {
  const t = TONE[tone];
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const pts = series.map((v, i) => [(i / (series.length - 1)) * w, h - ((v - min) / span) * (h - 4) - 2]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <path d={area} fill={t.fill} />
      <path d={line} fill="none" stroke={t.stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={2.5} fill={t.stroke} />
    </svg>
  );
}

/** Donut ring gauge (single value 0-100). */
export function DonutRing({ value, tone = "cyan", label, size = 168 }: { value: number; tone?: Tone; label?: string; size?: number }) {
  const t = TONE[tone];
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.stroke} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${dash} ${c - dash}`} style={{ filter: `drop-shadow(0 0 6px ${t.stroke})` }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-black text-white">{value}%</span>
        {label ? <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</span> : null}
      </div>
    </div>
  );
}

/** Dual-series area chart (recovered vs at-risk by week). */
export function AreaTrend({ labels, primary, secondary, primaryLabel, secondaryLabel }: { labels: string[]; primary: number[]; secondary: number[]; primaryLabel: string; secondaryLabel: string }) {
  const w = 720;
  const h = 200;
  const pad = 24;
  const all = [...primary, ...secondary];
  const max = Math.max(...all) * 1.15 || 1;
  const x = (i: number) => pad + (i / (labels.length - 1)) * (w - pad * 2);
  const y = (v: number) => h - pad - (v / max) * (h - pad * 2);
  const path = (s: number[]) => s.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const areaP = `${path(primary)} L${x(labels.length - 1)},${h - pad} L${x(0)},${h - pad} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={pad} x2={w - pad} y1={pad + g * (h - pad * 2)} y2={pad + g * (h - pad * 2)} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
        ))}
        <path d={areaP} fill={TONE.emerald.fill} />
        <path d={path(primary)} fill="none" stroke={TONE.emerald.stroke} strokeWidth={2.5} strokeLinejoin="round" />
        <path d={path(secondary)} fill="none" stroke="rgba(148,163,184,0.7)" strokeWidth={2} strokeDasharray="5 4" strokeLinejoin="round" />
        {primary.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={3} fill={TONE.emerald.stroke} />)}
        {labels.map((l, i) => <text key={l} x={x(i)} y={h - 6} textAnchor="middle" className="fill-slate-500 text-[11px] font-bold">{l}</text>)}
      </svg>
      <div className="mt-2 flex gap-4 text-xs font-bold text-slate-400">
        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" /> {primaryLabel}</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-4 rounded bg-slate-500" /> {secondaryLabel}</span>
      </div>
    </div>
  );
}

/** Funnel bars (recovery method mix). */
export function FunnelBars({ rows }: { rows: { label: string; value: number; share: number }[] }) {
  const max = Math.max(...rows.map((r) => r.share)) || 1;
  return (
    <div className="space-y-3">
      {rows.map((r, i) => {
        const tone: Tone = (["cyan", "violet", "emerald", "amber"] as Tone[])[i % 4];
        const t = TONE[tone];
        const width = 40 + (r.share / max) * 60;
        return (
          <div key={r.label} className="flex items-center gap-4">
            <div className="w-48 shrink-0 text-sm font-bold text-slate-200">{r.label}</div>
            <div className="relative h-9 flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center rounded-lg" style={{ width: `${width}%`, background: `linear-gradient(90deg, ${t.stroke}22, ${t.stroke}66)`, border: `1px solid ${t.stroke}55` }}>
                <span className="pl-3 text-xs font-black text-white">{r.value} · {r.share}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Horizontal bar list with status coloring (learners, sites). */
export function StatBars({ rows }: { rows: { label: string; sub?: string; value: number; tone: Tone; trailing?: string; trend?: "up" | "down" | "flat" }[] }) {
  return (
    <div className="space-y-3">
      {rows.map((r) => {
        const t = TONE[r.tone];
        return (
          <div key={r.label} className="flex items-center gap-3">
            <div className="w-44 shrink-0">
              <p className="text-sm font-bold text-slate-100">{r.label}</p>
              {r.sub ? <p className="text-[11px] text-slate-500">{r.sub}</p> : null}
            </div>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full" style={{ width: `${r.value}%`, background: t.stroke, boxShadow: `0 0 10px ${t.stroke}` }} />
            </div>
            <div className="flex w-20 items-center justify-end gap-1.5">
              <span className="text-xs font-black text-slate-200">{r.trailing ?? `${r.value}%`}</span>
              {r.trend ? <span className="text-[10px] text-slate-500">{r.trend === "up" ? "▲" : r.trend === "down" ? "▼" : "—"}</span> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function StatusDot({ status }: { status: "green" | "amber" | "red" }) {
  const color = status === "green" ? "#34d399" : status === "amber" ? "#fbbf24" : "#fb7185";
  return <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />;
}

export function Pill({ children, tone = "cyan" }: { children: ReactNode; tone?: Tone }) {
  const t = TONE[tone];
  return <span className={`rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${t.text}`}>{children}</span>;
}
