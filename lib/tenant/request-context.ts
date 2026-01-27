import { getTenantClient } from "@/lib/db/tenant-client";
import { env } from "@/lib/env";
import { resolveTenantByHost } from "@/lib/tenant/tenant-resolver";
import { headers } from "next/headers";

export const getTenantContext = async () => {
  const hdrs = await headers();
  const host =
    hdrs.get("x-forwarded-host") ??
    hdrs.get("x-tenant-hostname") ??
    hdrs.get("host") ??
    "";

  const tenant = await resolveTenantByHost(host);
  if (!tenant) return null;

  const client = getTenantClient(tenant.schemaName, env().DATABASE_URL);
  return { tenant, client };
};
