export const metadata = {
  title: "Provider Portal — Infinite Suite OS™ Tour | Recovery Radar™",
  description:
    "Walk through the Infinite Suite OS™ operational recovery workflow. Tour mock OS — sample data only, no PHI.",
  robots: { index: true, follow: true }
};

export default function ProviderPortalPage() {
  return (
    // fixed inset-0 = pinned to the viewport edges, full-bleed, no body padding,
    // no 100vw scrollbar gap. The OS fills the entire screen like a real app.
    <main className="fixed inset-0 z-0 bg-[#F4F7FB]">
      <iframe
        src="/provider-os/index.html"
        title="Infinite Suite OS™ — Provider Portal tour (sample data, no PHI)"
        className="absolute inset-0 h-full w-full border-0"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </main>
  );
}
