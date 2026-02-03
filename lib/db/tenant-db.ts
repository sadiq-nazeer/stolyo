import { env } from "@/lib/env";
import { withSearchPath } from "@/lib/db/url";
import { Kysely, type ColumnType, type Generated, PostgresDialect, sql } from "kysely";
import { Pool } from "pg";

export type ProductStatus = "draft" | "active" | "archived";

type Numeric = ColumnType<string, number | string, number | string>;
type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type CategoriesTable = {
  id: Generated<string>;
  name: string;
  slug: string | null;
  created_at: Timestamp;
};

export type ProductsTable = {
  id: Generated<string>;
  name: string;
  description: string | null;
  slug: string | null;
  status: ProductStatus;
  price: Numeric;
  compare_at_price: Numeric | null;
  sku: string | null;
  currency: string;
  stock_quantity: number;
  category_id: string | null;
  image_url: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type TenantDatabase = {
  categories: CategoriesTable;
  products: ProductsTable;
};

const tenantDbs = new Map<string, { db: Kysely<TenantDatabase>; pool: Pool }>();

export const getTenantDb = (schema: string, baseUrl?: string) => {
  const normalizedSchema = schema.trim().toLowerCase();
  const cached = tenantDbs.get(normalizedSchema);
  if (cached) return cached.db;

  const connectionString = withSearchPath(baseUrl ?? env().DATABASE_URL, normalizedSchema);
  const pool = new Pool({ connectionString });
  const dialect = new PostgresDialect({ pool });
  const db = new Kysely<TenantDatabase>({ dialect });

  tenantDbs.set(normalizedSchema, { db, pool });
  return db;
};

export const clearTenantDbs = async () => {
  const entries = [...tenantDbs.values()];
  tenantDbs.clear();
  await Promise.all(
    entries.map(async ({ db, pool }) => {
      await db.destroy();
      await pool.end();
    }),
  );
};

export const nowSql = () => sql<Date>`now()`;

