import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOwnerRadarData } from "@/lib/owner-demo-data";
import { Panel, StatBars } from "@/components/owner/radar-ui";
import type { Tone } from "@/components/owner/radar-ui";

export const metadata = { title: "Recovery Radar — By Site & Setting" };

function toneFor(rate: number): Tone {
  return rate >= 75 ? "emerald" : rate >= 55 ? "amber" : "rose";
}

export default async function SitesPage() {
  const session = await getServerSession(authOptions);
  const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
  const d = getOwnerRadarData(tenantId);
  const sites = [...d.bySite].sort((a, b) => b.recoveryRate - a.recoveryRate);
  const settings = [...d.bySetting].sort((a, b) => b.recoveryRate - a.recoveryRate);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.35em] text-cyan-400">Where recovery wins</p>
        <h1 className="mt-2 text-5xl font-black tracking-tight text-white">Winning &mdash; and slipping</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
          Recovery rate rolled up by site and by setting — so you can see which locations need a scheduler
          check-in. Individual learner detail lives inside Infinite Suite OS for the assigned clinician; the
          owner view stays at site level, no names, no PHI.
        </p>
      </div>

      <Panel eyebrow="Ranked, highest first" title="Recovery rate by site">
        <StatBars
          rows={sites.map((s) => ({
            label: s.site,
            sub: `${s.setting} · ${s.recoveredSessions}/${s.atRiskSessions} sessions recovered`,
            value: s.recoveryRate,
            tone: toneFor(s.recoveryRate),
            trailing: `${s.recoveryRate}%`,
            trend: s.trend
          }))}
        />
        <p className="mt-4 text-xs font-semibold text-slate-500">Green ≥75%, amber 55–74%, red &lt;55%. Recovery rate measures how many at-risk sessions became recovered, supported, review-ready hours — aggregated across all learners at each site.</p>
      </Panel>

      <Panel eyebrow="By care setting" title="Recovery rate by setting">
        <StatBars
          rows={settings.map((s) => ({
            label: s.setting,
            sub: `${s.recoveredSessions}/${s.atRiskSessions} sessions recovered`,
            value: s.recoveryRate,
            tone: toneFor(s.recoveryRate),
            trailing: `${s.recoveryRate}%`
          }))}
        />
        <p className="mt-4 text-xs font-semibold text-slate-500">School-setting sessions typically recover lowest — school-day constraints limit makeup windows. Use this to set realistic recovery targets per setting.</p>
      </Panel>
    </div>
  );
}
