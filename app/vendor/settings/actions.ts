'use server';

import { auth } from "@/auth";
import type { StoreConfig } from "@/lib/store/config";
import { getTenantContext } from "@/lib/tenant/request-context";

export const upsertStoreConfig = async (config: StoreConfig) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const context = await getTenantContext();
  if (!context) {
    throw new Error("Tenant not resolved");
  }

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
