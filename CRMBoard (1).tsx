import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { mockAnalytics } from "@/lib/mock-data";

export default function AnalyticsPage() {
  const funnel = [
    { label: "Visitors", value: 1240, pct: 100 },
    { label: "Calculator starts", value: 186, pct: 15 },
    { label: "Calculator completions", value: 92, pct: 7.4 },
    { label: "Quiz completions", value: 64, pct: 5.2 },
    { label: "Demo requests", value: 12, pct: 1 }
  ];

  return (
    <>
      <PageHeader
        eyebrow="Analytics"
        title="Conversion and recovery-interest reporting"
        description="Track public conversion events, calculator completions, quiz personas, Provider Portal clicks and demo requests."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mockAnalytics.map((metric) => <MetricCard key={metric.label} label={metric.label} value={metric.value} delta={metric.delta} />)}
      </div>
      <section className="card mt-8">
        <h2 className="text-2xl font-black text-slate-950">Launch funnel</h2>
        <div className="mt-6 space-y-4">
          {funnel.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-700">{item.label}</span>
                <span className="font-black text-slate-950">{item.value.toLocaleString()} · {item.pct}%</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-slate-950" style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
