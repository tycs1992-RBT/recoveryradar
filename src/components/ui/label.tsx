import type { LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Label({ className, children, ...props }: LabelHTMLAttributes<HTMLLabelElement> & { children: ReactNode }) {
  return <label className={cn("label", className)} {...props}>{children}</label>;
}
