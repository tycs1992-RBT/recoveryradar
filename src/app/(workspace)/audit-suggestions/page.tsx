import { AuditActionBoard } from "@/components/audit/AuditActionBoard";
import { PageHeader } from "@/components/ui/PageHeader";

export default function AuditSuggestionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Audit"
        title="Best combined version and implementation command center"
        description="A practical action board for the merged Recovery Radar™ app: open related pages, create tasks, mark priority, copy implementation prompts and open docs."
      />

      <AuditActionBoard />

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
