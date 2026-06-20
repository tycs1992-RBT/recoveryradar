import type { DefaultSession } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      role?: "admin" | "growth" | "viewer";
    };
  }

  interface User {
    role?: "admin" | "growth" | "viewer";
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: "admin" | "growth" | "viewer";
  }
}
