import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export type AppRole = "admin" | "growth" | "viewer";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "recovery-radar-local-dev-secret-change-before-deploy",
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
        const expectedEmail = process.env.DEMO_ADMIN_EMAIL ?? "founders@infinitepieces.ai";
        const expectedPassword = process.env.DEMO_ADMIN_PASSWORD ?? "infinitemark2026";

        if (
          credentials?.email?.toLowerCase() === expectedEmail.toLowerCase() &&
          credentials?.password === expectedPassword
        ) {
          return {
            id: "demo-admin",
            name: process.env.DEMO_ADMIN_NAME ?? "Founders",
            email: expectedEmail,
            role: "admin" as AppRole
          };
        }

        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as typeof user & { role?: AppRole }).role ?? "admin";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & { role?: AppRole }).role =
          (token.role as AppRole) ?? "viewer";
      }
      return session;
    }
  }
};
