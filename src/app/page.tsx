import Link from "next/link";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { coreMessage, coreModules } from "@/lib/constants";
import { offer } from "@/lib/pricing";

const visualAssets = {
  hero: "/brand-assets/hero_every_hour_recovered.png",
  workflow: "/brand-assets/recovery_trust_support_export.png",
  founder: "/brand-assets/founder_every_piece_matters.png",
  story: "/brand-assets/website_story_panels.png"
};

const publicSteps = [
  ["1", "Calculate lost hours", "Use clinic-level inputs only. Visitors see estimated weekly/monthly hours at risk, revenue exposure, admin burden and recovery opportunities."],
  ["2", "Check the stack", "The quiz helps EMR shoppers determine whether they need a new EMR or a no-migration recovery layer beside it."],
  ["3", "Ask Recovery Advisor", "The public chatbot answers general ABA operations, recovery workflow and Infinite Suite questions without collecting PHI."],
  ["4", "Enter Provider Portal", "Visitors can move into the mock operating system and return to this public homepage from the portal header." ]
];

export default function HomePage() {
  const foundingApplyHref =
    "mailto:founders@infinitepieces.ai" +
    "?subject=" +
    encodeURIComponent("Founding Clinic Application — Infinite Suite OS") +
    "&body=" +
    encodeURIComponent(
      [
        "Hi Infinite Pieces team,",
        "",
        "We'd like to apply as a founding clinic for the Infinite Suite OS recovery pilot.",
        "",
        "Clinic name:",
        "Your name and role:",
        "Number of sites:",
        "Approx. active learners:",
        "Current EMR:",
        "Biggest operational pain (cancellations, callouts, late notes, etc.):",
        "",
        "Thanks!"
      ].join("\n")
    );

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main>
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#ffffff_0%,#f0fbff_48%,#fff8ea_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(10,25,47,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(10,25,47,.035)_1px,transparent_1px)] bg-[length:44px_44px]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:py-24">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-cyan-800">
                ● Operational Recovery Core for ABA clinics
              </div>
              <h1 className="mt-6 max-w-5xl text-5xl font-black tracking-tight text-slate-950 sm:text-7xl">
                {offer.marketLine}
              </h1>
              <p className="mt-6 max-w-3xl text-xl font-black leading-8 text-slate-900">{offer.positioning}</p>
              <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-slate-600">
                Recover lost hours, reduce scheduler scramble, support staff, improve caregiver communication, and create cleaner proof packets without starting with a full EMR migration.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/calculator" className="rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-soft">Calculate lost hours</Link>
                <Link href="/quiz" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-800">Take operations quiz</Link>
                <Link href="/provider-portal" className="rounded-full border border-amber-200 bg-amber-100 px-6 py-3 text-sm font-black text-amber-950">Provider Portal</Link>
              </div>
              <p className="mt-4 text-xs font-bold leading-6 text-slate-500">
                Public forms use clinic-level estimates only. Do not submit client names, PHI, or sensitive clinical details.
              </p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-3 shadow-[0_24px_90px_rgba(6,17,37,.18)]">
              <img src={visualAssets.hero} alt="Infinite Pieces AI recovery workflow visual" className="w-full rounded-[1.5rem] object-cover" />
              <div className="mt-3 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm">
                <p className="font-black text-slate-950">Founding Pilot — prove it on our dime</p>
                <p className="mt-2 text-2xl font-black text-slate-950">Performance-based · 90 days</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">We measure your current recovery rate first, then you pay a small share only of what we recover above it. See the recovered-hour number before you ever commit to a plan. Unlimited staff + caregiver seats.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-400">Founding offer</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Start with the pilot. Pricing follows the proof.</h2>
            <p className="mt-4 text-base font-semibold leading-8 text-slate-600">
              Infinite Suite OS™ is not priced to punish staff growth, RBT turnover, substitutes, supervisors, caregivers, or floaters. Founding clinics start on a performance-based pilot — you see what it recovers before you pay a flat fee.
            </p>
          </div>

          {/* HERO: Founding Pilot — the one thing we want clinics to start with */}
          <div className="mt-8 overflow-hidden rounded-[2rem] border-2 border-cyan-300 bg-gradient-to-br from-cyan-50 to-white shadow-soft">
            <div className="grid gap-6 p-8 lg:grid-cols-[1.1fr_1fr] lg:p-10">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-white">Start here</span>
                <p className="mt-5 text-xs font-black uppercase tracking-[0.25em] text-cyan-700">{offer.plans[0].name}</p>
                <p className="mt-2 text-4xl font-black tracking-tight text-slate-950">{offer.plans[0].price}</p>
                <p className="mt-2 text-sm font-black text-cyan-800">{offer.plans[0].subprice}</p>
                <p className="mt-3 text-base font-bold leading-7 text-slate-600">{offer.plans[0].bestFor}</p>
                <a
                  href={foundingApplyHref}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-soft transition hover:bg-slate-800"
                >
                  Apply as a founding clinic →
                </a>
                <p className="mt-2 text-xs font-semibold text-slate-400">Opens an email to our founding team — no commitment.</p>
              </div>
              <ul className="space-y-3 text-sm font-semibold leading-6 text-slate-700 lg:border-l lg:border-cyan-200 lg:pl-8">
                {offer.plans[0].details.map((detail) => <li key={detail}>• {detail}</li>)}
              </ul>
            </div>
          </div>

          {/* DEMOTED: standard tiers — directional, set after the pilot proves out */}
          <div className="mt-10">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">{offer.tiersHeading}</p>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-slate-500">{offer.tiersFraming}</p>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {offer.plans.slice(1).map((plan) => (
                <article key={plan.name} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">{plan.name}</p>
                  <p className="mt-3 text-2xl font-black text-slate-700">{plan.price}</p>
                  {plan.subprice ? <p className="mt-1 text-xs font-bold text-slate-500">{plan.subprice}</p> : null}
                  {plan.bestFor ? <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{plan.bestFor}</p> : null}
                </article>
              ))}
            </div>
            <p className="mt-4 text-xs font-semibold leading-6 text-slate-400">
              {offer.breakEvenDisclaimer}
            </p>
          </div>

          <div className="mt-8 rounded-[2rem] border border-cyan-100 bg-cyan-50 p-6 text-cyan-950">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-700">Sales math</p>
            <p className="mt-3 text-lg font-black">{offer.roiLine}</p>
            <p className="mt-2 text-sm font-semibold leading-6">One recovered session ≈ 2 billable hours ≈ ~$155 collected. A clinic losing 20+ sessions a month — well within the industry 24–38% cancellation range — recovers a Recovery Core plan several times over, and watches it on the scoreboard. (Illustrative; validated in your pilot.)</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-400">How it works · the recovery cascade</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">When a session is at risk, every save is offered before it&rsquo;s lost.</h2>
            <p className="mt-4 text-base font-semibold leading-8 text-slate-600">
              A parent can always cancel. But the easy, one-tap alternatives come first &mdash; so canceling into a void becomes the last resort, not the first click. Every option is offered, never forced.
            </p>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-5">
            {[
              ["1", "Reschedule this week", "Same RBT, same continuity. Surfaced first."],
              ["2", "Telehealth this slot", "If clinically appropriate and the family is open to it."],
              ["3", "Caregiver coaching", "Keep the hour productive even when direct therapy isn't possible."],
              ["4", "Makeup on the board", "Post to your internal SubPool for coverage."],
              ["5", "Only then: cancel", "Logged, pattern-tracked, and routed for follow-up."]
            ].map(([n, title, body]) => (
              <article key={n} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-sm font-black text-cyan-800">{n}</div>
                <p className="mt-3 font-black text-slate-950">{title}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 rounded-[2rem] border border-cyan-100 bg-cyan-50 p-6 text-cyan-950">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-700">Ethical by design</p>
            <p className="mt-3 text-base font-semibold leading-7">This isn&rsquo;t about trapping families &mdash; it&rsquo;s about making the good option the easy option. Every recovery step is human-reviewed. Recovery Radar recommends; your team decides. It never auto-bills and is never the system of record.</p>
          </div>
        </section>

        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-400">Compliance · notes that can&rsquo;t slip</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">The note gets done. Every time. Before it costs you a claim.</h2>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <p className="font-black text-slate-950">Can&rsquo;t end a session without the note</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">The timer won&rsquo;t close until objective data is entered and signed. The note is done while the session is fresh &mdash; not at 10 p.m.</p>
              </article>
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <p className="font-black text-slate-950">Can&rsquo;t start the next session if notes are &gt;24h overdue</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">Fall behind, and the system holds the next punch-in until you&rsquo;re caught up. Documentation stays defensible; claims stay clean.</p>
              </article>
            </div>
            <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">Why it matters</p>
              <p className="mt-3 text-base font-semibold leading-7 text-slate-700">Unsigned and late notes are a top driver of denials and recoupments. This isn&rsquo;t bureaucracy &mdash; it&rsquo;s protecting revenue you&rsquo;ve already earned, and it&rsquo;s a number you can watch fall: documentation-defect rate, on-time note rate, notes outstanding.</p>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-16">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
              <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-400">Buyer objections</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Keep the EMR. Add the recovery layer.</h2>
              <div className="mt-6 space-y-5">
                {offer.objections.map(([question, answer]) => (
                  <div key={question} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-black text-slate-950">&ldquo;{question}&rdquo;</p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{answer}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-3 shadow-soft">
              <img src={visualAssets.workflow} alt="Recovery, trust, support and export visual" className="w-full rounded-[1.5rem] object-cover" />
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Core transformation</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Recover → Trust → Support → Export</h2>
                <p className="mt-4 text-sm font-semibold leading-6 text-slate-600">
                  A canceled session should not automatically become a lost hour. Infinite Suite OS™ shows how one disruption can be routed into a recovered, supported, documented, review-ready workflow beside the current EMR.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-400">Public visitor path</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Let clinics explore the recovery idea without exposing the private workspace.</h2>
            <p className="mt-4 text-base font-semibold leading-8 text-slate-600">
              The public can use the calculator, quiz, Recovery Advisor chatbot and Provider Portal. The internal lead finder, CRM, tasks and outreach workspace remain behind sign-in for you, Mark and Daniel.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {publicSteps.map(([num, title, copy]) => (
              <article key={num} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-100 text-xl font-black text-slate-950">{num}</div>
                <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-400">Private team workspace</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Recovery Radar™ is the growth machine that sells Infinite Suite OS™.</h2>
            <p className="mt-5 text-base font-semibold leading-8 text-slate-600">
              The private workspace contains the Lead Machine, Intent Crawler, Keyword Radar, SEO Command Center, CRM, task inbox, outreach drafts and campaign tools. It gives Mark a real workflow while Daniel hardens backend, auth, RBAC, tenant scoping, audit logs and integrations.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/login?callbackUrl=/dashboard" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">Team login</Link>
              <Link href="/provider-portal" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800">Tour Provider Portal</Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-3 shadow-soft">
            <img src={visualAssets.founder} alt="Founder why visual for Infinite Pieces AI" className="w-full rounded-[1.5rem] object-cover" />
          </div>
        </section>

        <section className="bg-slate-950 py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.35em] text-cyan-200">Core 7 recovery path</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight">From missed session to review-ready recovered hour.</h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {coreModules.map((module) => (
                <article key={module.name} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur">
                  <h3 className="text-lg font-black text-white">{module.name}</h3>
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-300">{module.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {module.bestFor.slice(0, 2).map((tag) => (
                      <span key={tag} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black text-cyan-100">{tag}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-3">
              <img src={visualAssets.story} alt="Infinite Pieces AI website story panels" className="w-full rounded-[1.5rem] object-cover" />
            </div>
          </div>
        </section>
      </main>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <ChatbotWidget compact />
      </div>
    </div>
  );
}
