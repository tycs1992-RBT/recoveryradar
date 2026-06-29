import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "Provider Portal — Infinite Suite OS™ | Recovery Radar™",
  description:
    "Infinite Suite OS™ operational recovery workflow. Sign in to view.",
  robots: { index: false, follow: false }
};

// NOTE: This route used to be the OPEN public "Take a Tour" mock (anyone could
// click in). It now requires login so it stops competing with the real provider
// login and nobody random lands in the embedded OS. To reopen it as a public
// tour later, delete the session check below and restore robots index:true.
export default async function ProviderPortalPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login?callbackUrl=/provider-workspace");
  }
  return (
    // fixed inset-0 = pinned to the viewport edges, full-bleed, no body padding,
    // no 100vw scrollbar gap. The OS fills the entire screen like a real app.
    <main className="fixed inset-0 z-0 bg-[#F4F7FB]">
      <iframe
        src="/provider-os/index.html"
        title="Infinite Suite OS™ (signed in)"
        className="absolute inset-0 h-full w-full border-0"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </main>
  );
}
