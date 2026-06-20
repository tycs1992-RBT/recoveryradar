import Link from "next/link";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { coreMessage, coreModules } from "@/lib/constants";

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
                ● Infinite Suite OS™ operational recovery demo
              </div>
              <h1 className="mt-6 max-w-5xl text-5xl font-black tracking-tight text-slate-950 sm:text-7xl">
                How many ABA hours did your clinic lose last week?
              </h1>
              <p className="mt-6 max-w-3xl text-xl font-black leading-8 text-slate-900">{coreMessage}</p>
              <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-slate-600">
                This public demo helps ABA clinic owners, founders, clinical directors, schedulers and operators estimate cancellation/callout leakage, ask operational recovery questions, and enter the mock Provider Portal.
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
                <p className="font-black text-slate-950">One clear wedge</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    "Recover lost hours",
                    "Support staff",
                    "Keep caregivers informed",
                    "Review-ready workflows"
                  ].map((chip) => (
                    <span key={chip} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">{chip}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-400">Public visitor path</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Let clinics explore the recovery idea without exposing the private workspace.</h2>
            <p className="mt-4 text-base font-semibold leading-8 text-slate-600">
              The public can use the calculator, quiz, Recovery Advisor chatbot and Provider Portal. The internal lead finder, CRM, tasks and outreach workspace remain behind sign-in for you and Mark.
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

        <section className="bg-slate-50 py-16">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-3 shadow-soft">
              <img src={visualAssets.workflow} alt="Recovery, trust, support and export visual" className="w-full rounded-[1.5rem] object-cover" />
            </div>
            <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-soft">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200">Core transformation</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight">Recover → Trust → Support → Export</h2>
              <p className="mt-5 text-base font-semibold leading-8 text-slate-300">
                A canceled session should not automatically become a lost hour. Infinite Suite OS™ shows how one disruption can be routed into a recovered, supported, documented, review-ready workflow beside the current EMR.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/calculator" className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950">Calculate lost hours</Link>
                <Link href="/provider-portal" className="rounded-full border border-white/20 px-5 py-3 text-sm font-black text-white">Enter Provider Portal</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-400">Private team workspace</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">You and Mark can sign in separately from the public demo.</h2>
            <p className="mt-5 text-base font-semibold leading-8 text-slate-600">
              The private workspace contains the lead finder, CRM, task inbox, outreach drafts and campaign tools. It can sit behind Cloudflare and a shared credential for now, while the public sees only the demo, calculator, quiz and Recovery Advisor.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/login?callbackUrl=/dashboard" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">Team login</Link>
              <a href="/current-demo/index.html" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800">Open original uploaded demo</a>
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
