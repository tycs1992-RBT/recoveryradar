"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell loadingMessage="Loading workspace login..." />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginShell({ children, loadingMessage }: { children?: React.ReactNode; loadingMessage?: string }) {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto grid min-h-[80vh] max-w-6xl place-items-center">
        <section className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
          <Link href="/" className="text-sm font-bold uppercase tracking-[0.28em] text-cyan-300">
            Infinite Pieces AI
          </Link>
          {loadingMessage ? <p className="mt-6 text-sm font-bold text-slate-300">{loadingMessage}</p> : children}
        </section>
      </div>
    </main>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const isOwner = callbackUrl.includes("recovery-radar");
  const error = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const errorMessage = useMemo(() => {
    if (!error) return "";
    if (error === "CredentialsSignin") return "The email or password is incorrect.";
    if (error === "Configuration") return "Login configuration is missing. Check environment values for NEXTAUTH_URL and NEXTAUTH_SECRET.";
    return "Login failed. Check your credentials and try again.";
  }, [error]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    await signIn("credentials", {
      email,
      password,
      callbackUrl
    });
    setLoading(false);
  }

  return (
    <LoginShell>
      <h1 className="mt-4 text-4xl font-black tracking-tight">{isOwner ? "Owner login" : "Team login"}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-300">
        {isOwner
          ? "Your clinic's Recovery Radar™ dashboard — see how Infinite Suite OS™ is recovering hours across your sites."
          : "Sign in to your private workspace."}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        {isOwner ? "Demo owner login: demo@company.com / infinitecompany" : null}
      </p>

      {errorMessage ? (
        <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
          {errorMessage}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-bold text-slate-200">Email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none ring-cyan-300 transition focus:ring-2"
            autoComplete="email"
            placeholder="Enter workspace email"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-bold text-slate-200">Password</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none ring-cyan-300 transition focus:ring-2"
            autoComplete="current-password"
            placeholder="Enter workspace password"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Sign in to workspace"}
        </button>
      </form>

      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-xs leading-6 text-slate-300">
        <p className="font-bold text-white">Private workspace</p>
        <p>This area is for authorized Infinite Pieces AI operators only.</p>
        <p className="mt-2 text-slate-400">Credentials are controlled through environment variables and are not displayed on this page.</p>
      </div>

      <div className="mt-5 flex items-center justify-between text-sm font-bold">
        <Link href="/" className="text-slate-300 hover:text-white">Back to public site</Link>
        <Link href="/provider-portal" className="text-cyan-300 hover:text-cyan-200">Provider Portal</Link>
      </div>
    </LoginShell>
  );
}
