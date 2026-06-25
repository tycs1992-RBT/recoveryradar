import { MarketingHeader } from "@/components/layout/MarketingHeader";

const keywordSections = [
  {
    name: "Core ABA Software Keywords",
    angle: "Core buyer keywords for practice management, EMR, scheduling, billing, documentation, data collection and clinic operations pages.",
    keywords: ["ABA practice management software", "ABA EMR software", "ABA clinic software", "ABA therapy software", "ABA scheduling software", "ABA billing software", "ABA documentation software", "ABA data collection software", "ABA session notes software", "ABA EHR software", "ABA staff scheduling software", "ABA caregiver communication software", "ABA authorization tracking software", "ABA utilization tracking software", "ABA compliance software", "ABA audit documentation software", "ABA revenue cycle management software", "ABA clinic operations software", "software for new ABA clinic", "ABA clinic startup software"]
  },
  {
    name: "Highest-Buyer-Intent Keywords",
    angle: "Money keywords for clinic owners, clinical directors, operations leaders and new ABA founders actively comparing software.",
    keywords: ["best ABA software", "best EMR for ABA therapy", "ABA EMR comparison", "ABA practice management system", "ABA therapy practice management software", "ABA software for startups", "ABA software for small clinics", "ABA software for new clinic", "ABA clinic management software", "ABA scheduling and billing software", "ABA billing and data collection software", "ABA data collection and scheduling software", "ABA session documentation software", "ABA authorization management software", "ABA insurance billing software"]
  },
  {
    name: "Competitor / Replacement Keywords",
    angle: "High-intent competitor searches. Use the angle: before replacing your EMR, calculate lost hours from cancellations, callouts and recovery gaps.",
    keywords: ["CentralReach alternative", "CentralReach competitor", "CentralReach replacement", "CentralReach vs Rethink", "CentralReach vs Motivity", "CentralReach vs Catalyst", "Rethink Behavioral Health alternative", "RethinkBH alternative", "Motivity alternative", "Catalyst ABA alternative", "Hi Rasmus alternative", "ATrack alternative", "ABA software alternatives", "best CentralReach alternative", "best ABA EMR alternative"]
  },
  {
    name: "Recovery / Lost-Hours Keywords",
    angle: "Infinite Suite OS wedge keywords for cancellations, makeup sessions, callouts, recovered hours and revenue leakage.",
    keywords: ["ABA cancellation management software", "ABA makeup session software", "ABA staff coverage software", "RBT callout coverage", "ABA cancellation recovery", "ABA recovered hours", "recover lost ABA hours", "ABA clinic lost revenue cancellations", "ABA clinic cancellation workflow", "ABA clinic makeup session workflow", "ABA scheduling recovery workflow", "ABA staff callout workflow", "ABA session recovery software", "ABA operations recovery software", "ABA revenue leakage cancellations"]
  },
  {
    name: "Staff Support / Retention Keywords",
    angle: "Staff support and retention terms for RBT callouts, field support, burnout, communication and scheduling pain.",
    keywords: ["RBT support software", "RBT burnout solutions ABA", "ABA staff retention software", "ABA field staff support software", "RBT session support app", "RBT documentation support", "ABA staff communication software", "ABA team communication software", "ABA clinic staff scheduling", "ABA RBT scheduling software", "ABA RBT callout management"]
  },
  {
    name: "Caregiver Communication Keywords",
    angle: "Care Pocket / caregiver communication keywords for secure updates, parent portals and makeup-session communication.",
    keywords: ["ABA caregiver communication software", "parent communication software for ABA clinics", "ABA parent portal software", "ABA caregiver portal", "ABA family communication software", "ABA secure caregiver updates", "ABA parent training scheduling software", "ABA makeup session communication", "caregiver cancellation ABA software"]
  },
  {
    name: "Compliance / Documentation Keywords",
    angle: "Documentation and audit-readiness terms. Use HIPAA-conscious and audit-readiness language, not blanket compliance guarantees.",
    keywords: ["ABA documentation software", "ABA audit documentation software", "ABA compliance software", "ABA session note review software", "ABA note review workflow", "ABA documentation readiness", "ABA clinical review software", "ABA proof packet", "ABA export packet software", "ABA billing documentation workflow", "ABA payer audit documentation", "ABA authorization documentation"]
  },
  {
    name: "New ABA Clinic / Startup Keywords",
    angle: "New clinic founder keywords for startup software, business stack, scheduling, billing, EMR and operations planning.",
    keywords: ["how to open an ABA clinic", "software for opening an ABA clinic", "ABA clinic startup software", "ABA practice startup software", "new ABA clinic software", "ABA clinic operations stack", "ABA clinic startup checklist", "ABA clinic business software", "ABA clinic scheduling software startup", "ABA clinic billing software startup", "ABA clinic EMR startup", "ABA clinic owner software", "BCBA starting ABA clinic"]
  }
] as const;

const best20 = ["ABA practice management software", "ABA EMR software", "ABA clinic software", "ABA scheduling software", "ABA billing software", "ABA documentation software", "ABA authorization tracking software", "ABA caregiver communication software", "ABA staff scheduling software", "ABA compliance software", "CentralReach alternative", "RethinkBH alternative", "Motivity alternative", "Catalyst ABA alternative", "software for new ABA clinic", "ABA clinic startup software", "ABA cancellation management software", "ABA makeup session software", "RBT callout coverage", "recover lost ABA hours"] as const;

const negativeKeywords = ["jobs", "career", "salary", "training", "RBT training", "BCBA exam", "free CEU", "certification", "course", "school", "near me", "therapy near me", "autism diagnosis", "diagnosis", "Medicaid provider list", "parent looking for ABA", "ABA services for my child", "ABA therapy for child", "insurance coverage", "what is ABA", "ABA therapy near me", "ABA services near me", "child therapy", "school ABA jobs"] as const;

export const metadata = {
  title: "ABA Software Keyword Bank | Infinite Suite OS",
  description: "High-intent ABA software, EMR, cancellation recovery, caregiver communication, compliance, startup and competitor keywords for Infinite Suite OS."
};

export default function ABAKeywordBankPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingHeader />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-400">SEO / ads / bot keyword bank</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-950">ABA software buyer keywords for Infinite Suite OS™</h1>
          <p className="mt-5 text-lg font-semibold leading-8 text-slate-600">
            Use this bank to feed Keyword Radar, Recovery Advisor bot labels, SerpApi prospect searches, and Google Ads campaigns. The core angle is: before replacing the EMR, calculate lost hours from cancellations, callouts, coverage gaps, caregiver communication, and documentation readiness.
          </p>
          <div className="mt-6 rounded-3xl bg-slate-950 p-6 text-white">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-200">Best Google Ads angle</p>
            <p className="mt-3 text-2xl font-black">Your EMR tracks sessions. Infinite Suite helps recover the sessions at risk of disappearing.</p>
            <p className="mt-3 text-sm font-semibold text-slate-300">CTA: Calculate your lost ABA hours, then tour the mock recovery OS.</p>
          </div>
        </section>

        <section className="mt-10 card">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">Best 20 to start with</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {best20.map((keyword) => <span key={keyword} className="badge bg-cyan-50 text-cyan-800">{keyword}</span>)}
          </div>
        </section>

        <section className="mt-10 grid gap-4 xl:grid-cols-2">
          {keywordSections.map((section) => (
            <article key={section.name} className="card">
              <h2 className="text-2xl font-black text-slate-950">{section.name}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{section.angle}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {section.keywords.map((keyword) => <span key={keyword} className="badge bg-slate-50">{keyword}</span>)}
              </div>
            </article>
          ))}
        </section>

        <section className="mt-10 card">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">Negative keywords for ads</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">Exclude these so paid traffic does not go to job seekers, parents searching for therapy, diagnosis searches, training, salary or school intent.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {negativeKeywords.map((keyword) => <span key={keyword} className="badge bg-rose-50 text-rose-800">{keyword}</span>)}
          </div>
        </section>
      </main>
    </div>
  );
}
