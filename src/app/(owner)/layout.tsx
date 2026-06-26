import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OwnerShell } from "@/components/owner/OwnerShell";

export default async function OwnerLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string; clinicName?: string } | undefined;
  // Only owner accounts belong here. Anyone else is sent to login.
  if (!user) redirect("/login?callbackUrl=/recovery-radar");
  if (user.role !== "owner") redirect("/dashboard");
  return <OwnerShell clinicName={user.clinicName ?? "Your clinic"}>{children}</OwnerShell>;
}
