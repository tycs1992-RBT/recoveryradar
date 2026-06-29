import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "Infinite Suite OS™ — Provider Workspace",
  description: "The full Infinite Suite OS™ provider operating system.",
  robots: { index: false, follow: false }
};

// The REAL provider workspace (not the public tour). Auth-gated: only a signed-in
// provider reaches it. Embeds the full finalized Infinite Suite OS build that lives
// at public/provider-os/. The public "Take a Tour" route (/provider-portal) embeds
// the SAME build but is open to everyone for the demo; this route is the logged-in
// entry point. When Daniel's backend lands, this is where real per-clinic data binds.
export default async function ProviderWorkspacePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login?callbackUrl=/provider-workspace");
  }

  return (
    <main className="fixed inset-0 z-0 bg-[#F4F7FB]">
      <iframe
        src="/provider-os/index.html"
        title="Infinite Suite OS™ — Provider Workspace"
        className="absolute inset-0 h-full w-full border-0"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </main>
  );
}
