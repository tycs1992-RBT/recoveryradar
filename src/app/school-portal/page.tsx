import Link from "next/link";
import { MarketingFooter } from "@/components/layout/MarketingFooter";

// Single source of truth for the school edition name — swap here if you prefer
// "Infinite Class OS" or "Infinite Desk OS".
const SCHOOL_OS = "Infinite Classroom OS";

export const metadata = {
  title: `School Portal — ${SCHOOL_OS}™ | Infinite Pieces AI`,
  description:
    "The ABA operating system for schools — data collection, field tools, visual schedules, and AAC for classroom teams. Tour with sample data, no PHI.",
  robots: { index: true, follow: true }
};

// Each app gets a cheerful "subject folder" color.
const coreApps = [
  { name: "Analyst Pocket™", role: "For the BCBA", blurb: "Run programs across the whole caseload, review data, and supervise a small team from one place.", color: "#0ea5e9", tint: "#e0f2fe" },
  { name: "Program Tree™", role: "Programs & targets", blurb: "Build and branch each learner's goals and targets — the clinical backbone the classroom collects against.", color: "#10b981", tint: "#d1fae5" },
  { name: "Field Pocket™", role: "For RBTs / paras", blurb: "Fast, in-the-moment data collection on a phone or tablet, built for the pace of a classroom.", color: "#f97316", tint: "#ffedd5" },
  { name: "Care Pocket™", role: "Family loop", blurb: "Keep caregivers in the loop with updates and home carryover, without anyone leaving the classroom.", color: "#ec4899", tint: "#fce7f3" },
  { name: "ZoneMate™", role: "Visual schedules & zones", blurb: "Visual schedules, transitions, and classroom zones that keep the day predictable for every learner.", color: "#8b5cf6", tint: "#ede9fe" },
  { name: "Gestalt AAC™", role: "Communication", blurb: "Gestalt language processing–aware AAC, so communication support is part of the room, not a separate device.", color: "#f59e0b", tint: "#fef3c7" }
];

const crayons = ["#0ea5e9", "#10b981", "#f97316", "#ec4899", "#8b5cf6", "#f59e0b"];

export default function SchoolPortalPage() {
  return (
    <>
    <main
      className="min-h-screen text-slate-800"
      style={{
        backgroundColor: "#fbfbf4",
        backgroundImage:
          "linear-gradient(rgba(14,165,233,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.06) 1px, transparent 1px)",
        backgroundSize: "30px 30px"
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* top bar */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-500 text-xl font-black text-white shadow-sm">∞</span>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-cyan-600">Infinite Pieces AI</p>
              <p className="text-base font-black leading-none text-slate-900">{SCHOOL_OS}™</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-amber-700">Tour · sample data</span>
            <Link href="/provider-portal" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:border-slate-300">See the clinic edition →</Link>
          </div>
        </div>

        {/* hero */}
        <div className="mt-12 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">
            School edition · lowest-cost tier
          </span>
          <h1 className="mt-4 text-5xl font-black leading-[1.04] tracking-tight text-slate-900 sm:text-6xl">
            The ABA operating system{" "}
            <span className="bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-500 bg-clip-text text-transparent">for schools.</span>
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            {SCHOOL_OS}™ is the classroom-first edition of Infinite Suite OS. Same engine, stripped to what a school
            team actually needs: fast data collection, field tools, visual schedules, and AAC — without the
            billing-recovery layer schools don&rsquo;t use.
          </p>
          {/* crayon-row accent */}
          <div className="mt-6 flex gap-1.5">
            {crayons.map((c) => (
              <span key={c} className="h-2.5 w-12 rounded-full" style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

        {/* who it's for */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { stat: "~20", label: "learners per program", bg: "#e0f2fe", fg: "#0369a1" },
            { stat: "1", label: "BCBA supervising", bg: "#d1fae5", fg: "#047857" },
            { stat: "A few", label: "RBTs / paraprofessionals", bg: "#fef3c7", fg: "#b45309" }
          ].map((b) => (
            <div key={b.label} className="rounded-3xl border border-white p-6 shadow-sm" style={{ backgroundColor: b.bg }}>
              <p className="text-4xl font-black" style={{ color: b.fg }}>{b.stat}</p>
              <p className="mt-1 text-sm font-bold text-slate-600">{b.label}</p>
            </div>
          ))}
        </div>

        {/* built around */}
        <div className="mt-6 rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">📌</span>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-cyan-600">Built around</p>
          </div>
          <p className="mt-2 text-lg font-black leading-7 text-slate-900">
            Data collection · field tools · visual schedules with Material Maker™
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-500">The three things a classroom team lives in all day — everything else gets out of the way.</p>
        </div>

        {/* the classroom reality — challenges schools face */}
        <div className="mt-14">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">The classroom reality</p>
          <h2 className="mt-1 text-3xl font-black text-slate-900">School teams are stretched thin</h2>
          <p className="mt-2 max-w-2xl text-base font-semibold text-slate-600">
            School-based ABA runs on a fraction of the resources a clinic has. Most teams are doing heroic work
            with tools that were never built for a classroom.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "🧩", title: "Under-equipped, under-prepared", body: "Paper data sheets, a shared binder, and whatever app the district had lying around — nothing built for ABA in a classroom.", color: "#0ea5e9", tint: "#e0f2fe" },
              { icon: "👥", title: "Too many students, too little time", body: "One BCBA stretched across ~20 learners and a handful of paras. There's no time to chase down scattered data.", color: "#f97316", tint: "#ffedd5" },
              { icon: "✂️", title: "Materials & visuals eat the day", body: "Building visual schedules, supports, and reinforcer materials by hand takes hours nobody has during a school week.", color: "#ec4899", tint: "#fce7f3" },
              { icon: "🌳", title: "Programs drift without structure", body: "Goals and targets live in someone's head or a doc — hard to run consistently across a rotating classroom team.", color: "#10b981", tint: "#d1fae5" },
              { icon: "🗣️", title: "Communication needs go unmet", body: "AAC is often a separate device or app, so it falls out of the moment instead of being part of the room.", color: "#8b5cf6", tint: "#ede9fe" },
              { icon: "📉", title: "Data that never turns into decisions", body: "When collection is slow and messy, the data sits unused — instead of guiding what happens next for each learner.", color: "#f59e0b", tint: "#fef3c7" }
            ].map((c) => (
              <div key={c.title} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <span className="grid h-11 w-11 place-items-center rounded-2xl text-xl" style={{ backgroundColor: c.tint }}>{c.icon}</span>
                <h3 className="mt-3 text-base font-black text-slate-900">{c.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{c.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-3xl border border-cyan-100 bg-gradient-to-r from-sky-50 to-emerald-50 p-6 text-center shadow-sm">
            <p className="text-base font-black text-slate-900">
              {SCHOOL_OS}™ is built for exactly this — fast data, ready-made visuals, and one place to run it all, so the team can spend their time on the kids, not the paperwork.
            </p>
          </div>
        </div>

        {/* core apps */}
        <div className="mt-14">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">Core apps</p>
          <h2 className="mt-1 text-3xl font-black text-slate-900">Six tools, one classroom</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {coreApps.map((a) => (
              <div key={a.name} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                {/* colored folder tab */}
                <div className="h-1.5 w-full" style={{ backgroundColor: a.color }} />
                <div className="p-6">
                  <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-black uppercase tracking-wide" style={{ backgroundColor: a.tint, color: a.color }}>
                    {a.role}
                  </span>
                  <h3 className="mt-3 text-lg font-black text-slate-900">{a.name}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{a.blurb}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* difference from clinic edition */}
        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-wide text-emerald-700">What schools get</p>
            <ul className="mt-3 space-y-2 text-sm font-bold text-slate-700">
              <li className="flex gap-2"><span className="text-emerald-500">✓</span> Classroom-paced data collection on any device</li>
              <li className="flex gap-2"><span className="text-emerald-500">✓</span> Visual schedules, transitions, and zones</li>
              <li className="flex gap-2"><span className="text-emerald-500">✓</span> AAC built into the room</li>
              <li className="flex gap-2"><span className="text-emerald-500">✓</span> One BCBA view across ~20 learners</li>
              <li className="flex gap-2"><span className="text-emerald-500">✓</span> Lowest-cost tier — priced for school budgets</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Left out on purpose</p>
            <ul className="mt-3 space-y-2 text-sm font-bold text-slate-500">
              <li className="flex gap-2"><span className="text-slate-300">—</span> No Recovery Radar / Recovery Waterfall — schools don&rsquo;t bill and recover sessions</li>
              <li className="flex gap-2"><span className="text-slate-300">—</span> No SubPool coverage marketplace</li>
              <li className="flex gap-2"><span className="text-slate-300">—</span> No revenue / RCM tooling</li>
            </ul>
            <p className="mt-4 text-xs font-semibold text-slate-400">Need recovery and revenue tools too? That&rsquo;s the clinic edition, Infinite Suite OS.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-14 rounded-3xl border border-slate-100 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-8 text-center shadow-sm">
          <h2 className="text-2xl font-black text-slate-900">Bring it to your school</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm font-semibold text-slate-600">The lowest-cost way to give a school team real ABA data tools — without paying for clinic billing features you won&rsquo;t use.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="mailto:founders@infinitepieces.ai?subject=Infinite%20Classroom%20OS%20%E2%80%94%20school%20interest" className="rounded-2xl bg-cyan-500 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-cyan-600">
              Talk to us about your school
            </Link>
            <Link href="/provider-portal" className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 transition hover:border-slate-300">
              Compare with the clinic edition
            </Link>
          </div>
        </div>

        <p className="mt-10 text-xs font-semibold leading-5 text-slate-400">
          Demonstration tour with illustrative, de-identified sample concepts — no real student information, no PHI.
          {" "}{SCHOOL_OS}™ supports classroom workflows and is not a billing or clinical system of record.
        </p>
      </div>
    </main>
    <MarketingFooter />
    </>
  );
}
