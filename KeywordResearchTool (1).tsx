import { PageHeader } from '@/components/ui/PageHeader';
import { auditSuggestions } from '@/lib/audit-suggestions';

const statusStyles = {
  implemented: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  scaffolded: 'bg-amber-50 text-amber-700 border-amber-100',
  recommended: 'bg-sky-50 text-sky-700 border-sky-100'
};

const priorityStyles = {
  High: 'bg-rose-50 text-rose-700 border-rose-100',
  Medium: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  Low: 'bg-slate-50 text-slate-700 border-slate-100'
};

export default function AuditSuggestionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Audit"
        title="Best combined version and implementation suggestions"
        description="A practical audit board for the merged Recovery Radar™ app: what is already implemented, what is scaffolded, and what should be prioritized next."
      />

      <div className="grid gap-4">
        {auditSuggestions.map((item) => (
          <article key={item.title} className="card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950">{item.title}</h2>
                <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">{item.rationale}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${priorityStyles[item.priority]}`}>
                  {item.priority}
                </span>
                <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${statusStyles[item.status]}`}>
                  {item.status}
                </span>
              </div>
            </div>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              <strong className="text-slate-950">Next step:</strong> {item.nextStep}
            </div>
          </article>
        ))}
      </div>

      <section className="card mt-6 bg-slate-950 text-white">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">Build decision</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight">Continue from the fuller App Router package.</h2>
        <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-300">
          The uploaded prototype is useful as a reference, but this combined version keeps the richer app architecture: App Router routes, API endpoints, Prisma schema, consent/audit models, deterministic bot flows, lead scoring, seed data, tests, docs, and CI.
        </p>
      </section>
    </>
  );
}
