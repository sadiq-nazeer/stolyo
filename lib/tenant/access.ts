import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { getTenantContext } from "@/lib/tenant/request-context";

/** Matches Prisma schema enum TenantRole */
export type TenantRole = "OWNER" | "ADMIN" | "MEMBER";

export type TenantAccessSuccess = {
  ok: true;
  userId: string;
  tenantId: string;
  role: TenantRole;
  tenantName: string;
};

export type TenantAccessFailure = {
  ok: false;
  reason: "unauthorized" | "no-tenant" | "forbidden";
};

export type TenantAccessResult = TenantAccessSuccess | TenantAccessFailure;

export const requireTenantAccess = async (
  allowedRoles: TenantRole[] = [],
): Promise<TenantAccessResult> => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { ok: false, reason: "unauthorized" };
  }

  const context = await getTenantContext();
  if (!context) {
    return { ok: false, reason: "no-tenant" };
  }

  const membership = await prisma.userTenant.findUnique({
    where: {
      userId_tenantId: {
        userId,
        tenantId: context.tenant.id,
      },
    },
  });

  if (!membership) {
    return { ok: false, reason: "forbidden" };
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
    return { ok: false, reason: "forbidden" };
  }

  return {
    ok: true,
    userId,
    tenantId: context.tenant.id,
    role: membership.role,
    tenantName: context.tenant.name,
  };
};
