import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <div className={cn("rounded-3xl border border-slate-200 bg-white p-6 shadow-soft", className)} {...props}>{children}</div>;
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <div className={cn("mb-5 border-b border-slate-100 pb-5", className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }) {
  return <h2 className={cn("text-2xl font-black text-slate-950", className)} {...props}>{children}</h2>;
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <div className={cn("text-sm leading-6 text-slate-600", className)} {...props}>{children}</div>;
}
