import Link from "next/link";

export default function ProviderPortalBridgePage() {
  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white">
      <div className="mx-auto mb-4 flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200">Infinite Pieces AI</p>
          <h1 className="mt-1 text-2xl font-black">Provider Portal Preview</h1>
          <p className="mt-1 text-sm text-slate-300">Mock operating system preview. No patient information should be entered.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/" className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/15">
            ← Back to public demo
          </Link>
          <Link href="/login?callbackUrl=/dashboard" className="rounded-full border border-cyan-200 bg-cyan-100 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-200">
            Team workspace
          </Link>
          <a href="/current-demo/index.html#provider-portal" className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-200">
            Open full static demo
          </a>
        </div>
      </div>
      <iframe
        src="/current-demo/index.html#provider-portal"
        title="Infinite Pieces Provider Portal"
        className="h-[calc(100vh-130px)] w-full rounded-3xl border border-white/10 bg-white shadow-2xl"
      />
    </main>
  );
}
