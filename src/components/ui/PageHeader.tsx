import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
      <div>
        {eyebrow ? <p className="text-sm font-bold uppercase tracking-[0.28em] text-slate-400">{eyebrow}</p> : null}
        <h1 className="mt-2 max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
        {description ? <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{description}</p> : null}
      </div>
      {children ? <div className="flex shrink-0 flex-wrap gap-3">{children}</div> : null}
    </div>
  );
}
