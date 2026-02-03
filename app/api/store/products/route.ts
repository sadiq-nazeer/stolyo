import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTenantAccess } from "@/lib/tenant/access";
import { getTenantDbContext } from "@/lib/tenant/tenant-db-context";
import { createProduct, listProducts } from "@/lib/products/product-repo";

const emptyToUndefined = <T extends string>(value: T) =>
  value.trim().length > 0 ? value : undefined;

const productCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  slug: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
  price: z.coerce.number().nonnegative(),
  compareAtPrice: z.coerce.number().nonnegative().optional(),
  sku: z.string().optional(),
  currency: z.string().length(3).optional(),
  stockQuantity: z.coerce.number().int().nonnegative().optional(),
  categoryId: z.string().uuid().optional(),
  imageUrl: z.string().url().optional(),
});

export const GET = async (request: Request) => {
  const access = await requireTenantAccess(["OWNER", "ADMIN", "MEMBER"]);
  if (!access.ok) {
    return NextResponse.json(
      { error: access.reason === "unauthorized" ? "Unauthorized" : "Forbidden" },
      { status: access.reason === "unauthorized" ? 401 : 403 },
    );
  }

  const context = await getTenantDbContext();
  if (!context) {
    return NextResponse.json({ error: "Tenant not resolved" }, { status: 400 });
  }

  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status");
  const status =
    statusParam === "draft" || statusParam === "active" || statusParam === "archived"
      ? statusParam
      : undefined;

  const products = await listProducts(context.db, status ? { status } : undefined);
  return NextResponse.json({ products });
};

export const POST = async (request: Request) => {
  const access = await requireTenantAccess(["OWNER", "ADMIN"]);
  if (!access.ok) {
    return NextResponse.json(
      { error: access.reason === "unauthorized" ? "Unauthorized" : "Forbidden" },
      { status: access.reason === "unauthorized" ? 401 : 403 },
    );
  }

  const context = await getTenantDbContext();
  if (!context) {
    return NextResponse.json({ error: "Tenant not resolved" }, { status: 400 });
  }

  const raw = await request.json();
  const parsed = productCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const created = await createProduct(context.db, {
    name: parsed.data.name,
    description: parsed.data.description ? emptyToUndefined(parsed.data.description) ?? null : null,
    slug: parsed.data.slug ? emptyToUndefined(parsed.data.slug) ?? null : null,
    status: parsed.data.status,
    price: parsed.data.price,
    compareAtPrice: parsed.data.compareAtPrice,
    sku: parsed.data.sku ? emptyToUndefined(parsed.data.sku) ?? null : null,
    currency: parsed.data.currency,
    stockQuantity: parsed.data.stockQuantity,
    categoryId: parsed.data.categoryId,
    imageUrl: parsed.data.imageUrl,
  });

  if (!created) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }

  return NextResponse.json({ product: created }, { status: 201 });
};

