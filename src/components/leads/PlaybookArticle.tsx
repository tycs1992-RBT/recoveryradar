import { playbookSections, playbookDisclaimer, type PlaybookBlock } from "@/lib/playbook-content";

function Block({ block }: { block: PlaybookBlock }) {
  if (block.type === "p") return <p className="mt-3 leading-7 text-slate-700">{block.text}</p>;
  if (block.type === "sub") return <p className="mt-3 font-bold text-slate-900">{block.text}</p>;
  return (
    <ul className="mt-3 space-y-2">
      {block.items.map((i, n) => (
        <li key={n} className="flex gap-2 leading-7 text-slate-700">
          <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-cyan-500" />
          <span>{i}</span>
        </li>
      ))}
    </ul>
  );
}

export function PlaybookArticle() {
  return (
    <article>
      {playbookSections.map((s) => (
        <section key={s.heading} className="mt-6 first:mt-0">
          <h2 className="text-lg font-black text-slate-900">{s.heading}</h2>
          {s.blocks.map((b, i) => (
            <Block key={i} block={b} />
          ))}
        </section>
      ))}
      <p className="mt-8 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-400">{playbookDisclaimer}</p>
    </article>
  );
}
