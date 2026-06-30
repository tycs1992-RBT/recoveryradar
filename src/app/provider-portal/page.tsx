export const metadata = {
  title: "Take a Tour: Infinite Suite OS™ | Recovery Radar™",
  description:
    "Explore Infinite Suite OS™, the operational recovery workflow, on sample data. Core 9 demo, no login, no PHI.",
  robots: { index: false, follow: false }
};

// OPEN public demo / Take a Tour. No login. Embeds the Core 9 DEMO build at
// public/provider-os-demo/ (only the nine core apps, no held-back apps, no phase
// toggle), so the public can look without seeing unreleased work. The real full
// product (phase toggles and all apps) lives behind login at /provider-workspace,
// which embeds the separate full build at public/provider-os/.
export default function ProviderPortalPage() {
  return (
    <main className="fixed inset-0 z-0 bg-[#F4F7FB]">
      <iframe
        src="/provider-os-demo/index.html"
        title="Infinite Suite OS™ (Core 9 demo)"
        className="absolute inset-0 h-full w-full border-0"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </main>
  );
}
