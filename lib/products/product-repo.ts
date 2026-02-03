import type { Kysely } from "kysely";
import { sql } from "kysely";
import type { ProductStatus, TenantDatabase } from "@/lib/db/tenant-db";
import { toSlug } from "@/lib/utils/slug";

export type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  slug: string | null;
  status: ProductStatus;
  price: string;
  compare_at_price: string | null;
  sku: string | null;
  currency: string;
  stock_quantity: number;
  category_id: string | null;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
};

const asProductRow = (row: unknown): ProductRow => row as ProductRow;

export const listProducts = async (
  db: Kysely<TenantDatabase>,
  opts?: { status?: ProductStatus },
) => {
  let q = db.selectFrom("products").selectAll().orderBy("created_at desc");
  if (opts?.status) {
    q = q.where("status", "=", opts.status);
  }
  const rows = await q.execute();
  return rows.map(asProductRow);
};

export const getProductById = async (db: Kysely<TenantDatabase>, id: string) => {
  const row = await db
    .selectFrom("products")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
  return row ? asProductRow(row) : null;
};

export const getProductBySlug = async (db: Kysely<TenantDatabase>, slug: string) => {
  const row = await db
    .selectFrom("products")
    .selectAll()
    .where("slug", "=", slug)
    .executeTakeFirst();
  return row ? asProductRow(row) : null;
};

export type CreateProductInput = {
  name: string;
  description?: string | null;
  slug?: string | null;
  status?: ProductStatus;
  price: number;
  compareAtPrice?: number | null;
  sku?: string | null;
  currency?: string;
  stockQuantity?: number;
  categoryId?: string | null;
  imageUrl?: string | null;
};

const ensureUniqueSlug = async (
  db: Kysely<TenantDatabase>,
  desired: string,
  excludeId?: string,
) => {
  const base = desired;
  for (let i = 0; i < 50; i += 1) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const query = db
      .selectFrom("products")
      .select(["id"])
      .where("slug", "=", candidate);
    const existing = excludeId
      ? await query.where("id", "!=", excludeId).executeTakeFirst()
      : await query.executeTakeFirst();
    if (!existing) return candidate;
  }
  return `${base}-${Date.now()}`;
};

export const createProduct = async (db: Kysely<TenantDatabase>, input: CreateProductInput) => {
  const baseSlug = toSlug(input.slug?.trim() || input.name);
  const slug = await ensureUniqueSlug(db, baseSlug);

  const status: ProductStatus = input.status ?? "draft";
  const currency = (input.currency ?? "USD").trim().toUpperCase();

  const inserted = await db
    .insertInto("products")
    .values({
      name: input.name.trim(),
      description: input.description ?? null,
      slug,
      status,
      price: input.price,
      compare_at_price: input.compareAtPrice ?? null,
      sku: input.sku?.trim() || null,
      currency,
      stock_quantity: input.stockQuantity ?? 0,
      category_id: input.categoryId ?? null,
      image_url: input.imageUrl?.trim() || null,
      created_at: sql`now()`,
      updated_at: sql`now()`,
    })
    .returningAll()
    .executeTakeFirst();

  return inserted ? asProductRow(inserted) : null;
};

export type UpdateProductInput = {
  name?: string;
  description?: string | null;
  slug?: string | null;
  status?: ProductStatus;
  price?: number;
  compareAtPrice?: number | null;
  sku?: string | null;
  currency?: string;
  stockQuantity?: number;
  categoryId?: string | null;
  imageUrl?: string | null;
};

export const updateProduct = async (
  db: Kysely<TenantDatabase>,
  id: string,
  input: UpdateProductInput,
) => {
  const updates: Record<string, unknown> = {
    updated_at: sql`now()`,
  };

  if (input.name !== undefined) updates.name = input.name.trim();
  if (input.description !== undefined) updates.description = input.description;
  if (input.status !== undefined) updates.status = input.status;
  if (input.price !== undefined) updates.price = input.price;
  if (input.compareAtPrice !== undefined) updates.compare_at_price = input.compareAtPrice;
  if (input.sku !== undefined) updates.sku = input.sku?.trim() || null;
  if (input.currency !== undefined) updates.currency = input.currency.trim().toUpperCase();
  if (input.stockQuantity !== undefined) updates.stock_quantity = input.stockQuantity;
  if (input.categoryId !== undefined) updates.category_id = input.categoryId;
  if (input.imageUrl !== undefined) updates.image_url = input.imageUrl?.trim() || null;

  if (input.slug !== undefined) {
    const baseSlug = toSlug(input.slug?.trim() || "");
    updates.slug = await ensureUniqueSlug(db, baseSlug, id);
  }

  if (Object.keys(updates).length === 1) {
    return getProductById(db, id);
  }

  const updated = await db
    .updateTable("products")
    .set(updates)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirst();

  return updated ? asProductRow(updated) : null;
};

export const deleteProduct = async (db: Kysely<TenantDatabase>, id: string) => {
  const deleted = await db
    .deleteFrom("products")
    .where("id", "=", id)
    .returning(["id"])
    .executeTakeFirst();
  return deleted?.id ?? null;
};

export const listActiveStorefrontProducts = async (db: Kysely<TenantDatabase>) => {
  const rows = await db
    .selectFrom("products")
    .selectAll()
    .where("status", "=", "active")
    .orderBy("created_at desc")
    .execute();
  return rows.map(asProductRow);
};

