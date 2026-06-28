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

        // Founder workspace login (internal growth/intel suite).
        const founderEmail = (process.env.DEMO_ADMIN_EMAIL ?? "founders@infinitepieces.ai").toLowerCase();
        const founderPassword = process.env.DEMO_ADMIN_PASSWORD ?? (isProd ? "" : "infinitemark2026");
        if (founderPassword && email === founderEmail && password === founderPassword) {
          return {
            id: "demo-admin",
            name: process.env.DEMO_ADMIN_NAME ?? "Founders",
            email: founderEmail,
            role: "admin" as AppRole
          };
        }

        // Owner workspace login — clinic CEO's Recovery Radar dashboard (demo tenant).
        const ownerEmail = (process.env.DEMO_OWNER_EMAIL ?? "demo@infinitepieces.ai").toLowerCase();
        const ownerPassword = process.env.DEMO_OWNER_PASSWORD ?? "infinitedemo";;
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
