import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { PageHeader } from "@/components/ui/PageHeader";
import { botNodes } from "@/lib/bot-flows";

export default function BotBuilderPage() {
  return (
    <>
      <PageHeader
        eyebrow="Recovery Advisor"
        title="Website conversion bot"
        description="Preview the public Recovery Advisor chatbot and review the configured no-PHI conversation flows."
      />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <ChatbotWidget />
        <section className="card">
          <h2 className="text-2xl font-black text-slate-950">Configured flows</h2>
          <div className="mt-5 space-y-4">
            {Object.values(botNodes).slice(0, 10).map((node) => (
              <article key={node.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-black text-slate-950">{node.id}</h3>
                  {node.captureLead ? <span className="badge bg-amber-50 text-amber-700">Lead capture</span> : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{node.message}</p>
                {node.options ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {node.options.map((option) => <span key={option.value} className="badge bg-slate-50">{option.label}</span>)}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
