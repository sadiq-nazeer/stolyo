import "next-auth";
import type { TenantRole } from "@/lib/tenant/access";

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      tenantId?: string;
      tenantRole?: TenantRole;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    tenantId?: string | null;
    tenantRole?: TenantRole | null;
  }
}
