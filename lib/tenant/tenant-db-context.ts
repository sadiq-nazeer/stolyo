import { getTenantDb } from "@/lib/db/tenant-db";
import { env } from "@/lib/env";
import { getTenantContext } from "@/lib/tenant/request-context";

export const getTenantDbContext = async () => {
  const context = await getTenantContext();
  if (!context) return null;

  const db = getTenantDb(context.tenant.schemaName, env().DATABASE_URL);
  return { tenant: context.tenant, db };
};

