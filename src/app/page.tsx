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
                <p className="font-black text-slate-950">Founding Clinic Trial</p>
                <p className="mt-2 text-2xl font-black text-slate-950">$15 per active learner/month</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">$500/month minimum · unlimited staff seats · unlimited caregiver seats · no implementation fee · 3-month pilot · recovered-hour scorecard included.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-400">Founding offer</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Priced around active learners and recovered operational value.</h2>
            <p className="mt-4 text-base font-semibold leading-8 text-slate-600">
              Infinite Suite OS™ is not priced to punish staff growth, RBT turnover, substitutes, supervisors, caregivers, or floaters. It is priced around active learners and the operational value recovered beside the clinic’s current EMR.
            </p>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {offer.plans.map((plan) => (
              <article key={plan.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">{plan.name}</p>
                <p className="mt-4 text-3xl font-black text-slate-950">{plan.price}</p>
                {plan.subprice ? <p className="mt-2 text-sm font-black text-cyan-800">{plan.subprice}</p> : null}
                <ul className="mt-5 space-y-3 text-sm font-semibold leading-6 text-slate-600">
                  {plan.details.map((detail) => <li key={detail}>• {detail}</li>)}
                </ul>
              </article>
            ))}
          </div>
          <div className="mt-6 rounded-[2rem] border border-cyan-100 bg-cyan-50 p-6 text-cyan-950">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-700">Sales math</p>
            <p className="mt-3 text-lg font-black">If Infinite recovers only 3 sessions/month × 3 hours/session × $80/hour, that is $720/month in recovered value.</p>
            <p className="mt-2 text-sm font-semibold leading-6">A $500–$750/month product can justify itself by recovering only a few missed sessions.</p>
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
                    <p className="font-black text-slate-950">“{question}”</p>
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
