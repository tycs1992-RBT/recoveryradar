import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Row = {
  id: string;
  createdAt: Date;
  path: string;
  company: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  isHighIntent: boolean;
};

// ISP / carrier names that mean "residential or mobile" — i.e. an unresolved
// individual, not a company network. Used to separate real signal from noise.
const RESIDENTIAL = /comcast|xfinity|verizon|at&t|at t|spectrum|charter|cox communications|centurylink|lumen|frontier|t-mobile|sprint|google fiber|cellular|wireless|broadband|residential|dsl|cable one|mediacom|optimum|altice|windstream/i;

function isResolvedCompany(company: string | null): company is string {
  return !!company && !RESIDENTIAL.test(company);
}

export async function VisitorIntelView() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return <p className="text-slate-500">Please sign in.</p>;

  const tokenSet = !!process.env.IPINFO_TOKEN;

  if (!process.env.DATABASE_URL) {
    return <Note>Connect your database to start capturing visitor intel. Then set <Code>IPINFO_TOKEN</Code> to resolve companies.</Note>;
  }

  let rows: Row[] = [];
  try {
    rows = (await prisma.visitorIntel.findMany({ orderBy: { createdAt: "desc" }, take: 250 })) as Row[];
  } catch {
    return <Note>Run <Code>npx prisma migrate dev</Code> to create the visitor-intel table, then redeploy.</Note>;
  }

  const resolvedHighIntent = rows.filter((r) => r.isHighIntent && isResolvedCompany(r.company));
  const counts = resolvedHighIntent.reduce<Record<string, number>>((m, r) => {
    m[r.company as string] = (m[r.company as string] ?? 0) + 1;
    return m;
  }, {});
  const topCompanies = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12);

  return (
    <div className="space-y-6">
      {/* Honest explainer — this is the part that keeps you from over-trusting it */}
      <div className="rounded-2xl border border-cyan-200 bg-cyan-50/60 px-5 py-4 text-sm leading-6 text-slate-700">
        <span className="font-black text-cyan-800">What this is.</span> Company-level reverse-IP on who&rsquo;s browsing your public pages. It&rsquo;s your closest read on who&rsquo;s actively shopping — but it&rsquo;s partial: visitors on a corporate network resolve to a company, while anyone on home wifi or a phone resolves only to their ISP (Comcast, Verizon…). Treat resolved companies as leads; treat the rest as anonymous traffic volume.
        {!tokenSet && (
          <span className="mt-2 block font-bold text-amber-800">
            Company names are off until you set the <Code>IPINFO_TOKEN</Code> environment variable (free tier at ipinfo.io). Until then you&rsquo;ll see visits without companies.
          </span>
        )}
      </div>

      {/* Top resolved companies on high-intent pages */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide text-slate-500">Companies on your high-intent pages</p>
        <p className="mt-1 text-xs font-semibold text-slate-400">Resolved company networks that hit pricing, calculator, quiz, or the provider tour. These are your warm prospects.</p>
        {topCompanies.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">{tokenSet ? "No company-level visits yet. They'll appear here as corporate-network visitors browse your high-intent pages." : "Set IPINFO_TOKEN to start resolving companies."}</p>
        ) : (
          <div className="mt-4 space-y-2">
            {topCompanies.map(([company, n]) => (
              <div key={company} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                <span className="font-bold text-slate-900">{company}</span>
                <span className="badge bg-cyan-50 text-cyan-700">{n} visit{n === 1 ? "" : "s"}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent activity */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide text-slate-500">Recent activity</p>
        {rows.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No visits captured yet. Once people browse your site, they&rsquo;ll show up here.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-left text-xs font-black uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-2 pr-3">When</th>
                  <th className="py-2 pr-3">Company / network</th>
                  <th className="py-2 pr-3">Page</th>
                  <th className="py-2 pr-3">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.slice(0, 60).map((r) => {
                  const resolved = isResolvedCompany(r.company);
                  return (
                    <tr key={r.id}>
                      <td className="py-2.5 pr-3 align-top text-slate-500">{new Date(r.createdAt).toLocaleString()}</td>
                      <td className="py-2.5 pr-3 align-top">
                        <span className={resolved ? "font-bold text-slate-900" : "text-slate-400"}>{r.company ?? "Unknown"}</span>
                        {!resolved && <span className="ml-1 text-[10px] uppercase tracking-wide text-slate-400">residential / isp</span>}
                      </td>
                      <td className="py-2.5 pr-3 align-top">
                        <span className="text-slate-700">{r.path}</span>
                        {r.isHighIntent && <span className="badge ml-2 bg-amber-50 text-amber-700">high intent</span>}
                      </td>
                      <td className="py-2.5 pr-3 align-top text-slate-500">{[r.city, r.region, r.country].filter(Boolean).join(", ") || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold leading-6 text-amber-800">{children}</div>;
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-slate-900/90 px-1.5 py-0.5 text-xs font-bold text-white">{children}</code>;
}
