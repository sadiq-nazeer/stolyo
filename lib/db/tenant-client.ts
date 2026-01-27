import { withSearchPath } from "@/lib/db/url";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const tenantClients = new Map<string, PrismaClient>();

export const getTenantClient = (schema: string, baseUrl: string) => {
  const normalizedSchema = schema.trim().toLowerCase();
  if (tenantClients.has(normalizedSchema)) {
    return tenantClients.get(normalizedSchema)!;
  }

  const urlWithSchema = withSearchPath(baseUrl, normalizedSchema);
  const pool = new Pool({ connectionString: urlWithSchema });
  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  tenantClients.set(normalizedSchema, client);
  return client;
};

export const clearTenantClients = () => {
  tenantClients.forEach((client) => void client.$disconnect());
  tenantClients.clear();
};
