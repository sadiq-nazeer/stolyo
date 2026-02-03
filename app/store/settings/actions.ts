'use server';

import type { StoreConfig } from "@/lib/store/config";
import { requireTenantAccess } from "@/lib/tenant/access";
import { getTenantContext } from "@/lib/tenant/request-context";

export const upsertStoreConfig = async (config: StoreConfig) => {
  const access = await requireTenantAccess(["OWNER", "ADMIN"]);
  if (!access.ok) {
    throw new Error(access.reason === "unauthorized" ? "Unauthorized" : "Forbidden");
  }

  const context = await getTenantContext();
  if (!context) throw new Error("Tenant not resolved");

  const configJson = JSON.stringify(config);
  await context.client.$transaction([
    context.client.$executeRawUnsafe(`DELETE FROM "store_configs";`),
    context.client.$executeRawUnsafe(
      `INSERT INTO "store_configs" (id, config, updated_at) VALUES (gen_random_uuid(), $1::jsonb, NOW())`,
      configJson,
    ),
  ]);

  return config;
};
