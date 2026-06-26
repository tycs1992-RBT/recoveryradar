import type { DefaultSession } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

type AppRoleAug = "admin" | "growth" | "viewer" | "owner";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      role?: AppRoleAug;
      tenantId?: string;
      clinicName?: string;
    };
  }

  interface User {
    role?: AppRoleAug;
    tenantId?: string;
    clinicName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: AppRoleAug;
    tenantId?: string;
    clinicName?: string;
  }
}
