import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export type AppRole = "admin" | "growth" | "viewer" | "owner";

const isProd = process.env.NODE_ENV === "production";
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
if (isProd && !nextAuthSecret) {
  throw new Error("NEXTAUTH_SECRET is required in production. Set it in your environment.");
}

export const authOptions: NextAuthOptions = {
  secret: nextAuthSecret ?? "dev-only-insecure-secret-not-used-in-production",
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  providers: [
    CredentialsProvider({
      name: "Demo login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase() ?? "";
        const password = credentials?.password ?? "";

        // Founder / worker login — the private internal lead-gen suite (for me and my
        // staff). This is the SENSITIVE login, so its password stays environment-gated
        // (never hard-coded — this repo is public). It is checked FIRST, so its email
        // MUST be different from the owner demo email below; otherwise the demo login
        // would match here and land on the founder view instead of the owner dashboard.
        // In production set DEMO_ADMIN_EMAIL + DEMO_ADMIN_PASSWORD in Vercel.
        const founderEmail = (process.env.DEMO_ADMIN_EMAIL ?? "worker@infinitepieces.ai").toLowerCase();
        const founderPassword = process.env.DEMO_ADMIN_PASSWORD ?? (isProd ? "" : "infinitemark2026");
        if (founderPassword && email === founderEmail && password === founderPassword) {
          return {
            id: "demo-admin",
            name: process.env.DEMO_ADMIN_NAME ?? "Founders",
            email: founderEmail,
            role: "admin" as AppRole
          };
        }

        // Owner demo login — the clinic CEO's Recovery Radar dashboard (demo tenant).
        // This is a PUBLIC showcase login: its credentials are shown on the login page
        // and it only exposes demo aggregate data (no PHI), so it's enabled in production.
        // Distinct from the founder/worker email above so the two never collide.
        // Override in Vercel with DEMO_OWNER_EMAIL / DEMO_OWNER_PASSWORD if you want.
        const ownerEmail = (process.env.DEMO_OWNER_EMAIL ?? "demo@company.com").toLowerCase();
        const ownerPassword = process.env.DEMO_OWNER_PASSWORD ?? "infinitecompany";
        if (ownerPassword && email === ownerEmail && password === ownerPassword) {
          return {
            id: "demo-owner",
            name: "North Star ABA (demo)",
            email: ownerEmail,
            role: "owner" as AppRole,
            tenantId: "demo-clinic",
            clinicName: "North Star ABA"
          } as { id: string; name: string; email: string; role: AppRole; tenantId: string; clinicName: string };
        }

        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as typeof user & { role?: AppRole; tenantId?: string; clinicName?: string };
        token.role = u.role ?? "admin";
        if (u.tenantId) token.tenantId = u.tenantId;
        if (u.clinicName) token.clinicName = u.clinicName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const su = session.user as typeof session.user & { role?: AppRole; tenantId?: string; clinicName?: string };
        su.role = (token.role as AppRole) ?? "viewer";
        su.tenantId = token.tenantId as string | undefined;
        su.clinicName = token.clinicName as string | undefined;
      }
      return session;
    }
  }
};
