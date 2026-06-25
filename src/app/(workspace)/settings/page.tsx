import { PageHeader } from "@/components/ui/PageHeader";
import { compliancePrinciples } from "@/lib/constants";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Security, compliance and integration checklist"
        description="Configure production credentials, role-based access, consent workflows, audit logging, external APIs and deployment settings."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="text-2xl font-black text-slate-950">Compliance principles</h2>
          <div className="mt-5 space-y-3">
            {compliancePrinciples.map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{item}</div>
            ))}
          </div>
        </section>
        <section className="card">
          <h2 className="text-2xl font-black text-slate-950">Production environment</h2>
          <div className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
            <p><strong className="text-slate-950">DATABASE_URL:</strong> Supabase or hosted Postgres connection string.</p>
            <p><strong className="text-slate-950">NEXTAUTH_SECRET:</strong> Long random secret for session signing.</p>
            <p><strong className="text-slate-950">OPENAI_API_KEY:</strong> Optional server-side content generation and future AI workflows.</p>
            <p><strong className="text-slate-950">GOOGLE_SEARCH_API_KEY / CX:</strong> Optional public-source intent discovery via Google Custom Search.</p>
            <p><strong className="text-slate-950">Email provider:</strong> Add after compliance review; keep manual approval before sending.</p>
          </div>
        </section>
      </div>
    </>
  );
}
