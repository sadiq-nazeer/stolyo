import { defaultStoreConfig, StoreConfig } from "@/lib/store/config";
import { getTenantContext } from "@/lib/tenant/request-context";
import { Prisma } from "@prisma/client";

type StoreConfigRow = {
  config: Prisma.JsonValue;
};

const parseConfig = (row?: StoreConfigRow | null): StoreConfig => {
  if (!row || row.config === undefined || row.config === null) {
    return defaultStoreConfig;
  }

  if (typeof row.config !== "object" || Array.isArray(row.config)) {
    return defaultStoreConfig;
  }

  return {
    ...defaultStoreConfig,
    ...(row.config as Record<string, unknown>),
  } as StoreConfig;
};

export const loadStoreConfig = async (): Promise<StoreConfig> => {
  const context = await getTenantContext();
  if (!context) return defaultStoreConfig;

  const result = (await context.client.$queryRaw<
    StoreConfigRow[]
  >`SELECT config FROM "store_configs" LIMIT 1`) ?? [];

  return parseConfig(result[0]);
};
