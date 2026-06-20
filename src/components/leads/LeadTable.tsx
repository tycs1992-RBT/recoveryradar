import Link from "next/link";
import { mockLeads, type MockLead } from "@/lib/mock-data";
import { ScorePill } from "@/components/ui/ScorePill";

export function LeadTable({ leads = mockLeads }: { leads?: MockLead[] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Company</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">Source</th>
              <th className="px-5 py-4">Score</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Next step</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => (
              <tr key={lead.id} className="align-top hover:bg-slate-50/80">
                <td className="px-5 py-4">
                  <p className="font-black text-slate-950">{lead.companyName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {lead.city ? `${lead.city}, ` : ""}{lead.state} · {lead.currentEmr ?? "EMR unknown"}
                  </p>
                </td>
                <td className="px-5 py-4 text-slate-600">
                  <p className="font-semibold text-slate-800">{lead.contactName ?? "—"}</p>
                  <p className="text-xs">{lead.contactRole ?? "Research needed"}</p>
                </td>
                <td className="px-5 py-4"><span className="badge">{lead.source}</span></td>
                <td className="px-5 py-4"><ScorePill score={lead.leadScore} /></td>
                <td className="px-5 py-4 text-slate-600">{lead.status}</td>
                <td className="px-5 py-4 text-slate-600">
                  <p>{lead.nextStep ?? "Research and score"}</p>
                  <Link href="/outreach" className="mt-2 inline-block text-xs font-bold text-slate-950 underline">
                    Draft outreach
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
