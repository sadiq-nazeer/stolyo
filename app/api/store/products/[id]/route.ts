import { NextResponse } from "next/server";
import { z } from "zod";
import { requireTenantAccess } from "@/lib/tenant/access";
import { getTenantDbContext } from "@/lib/tenant/tenant-db-context";
import { deleteProduct, getProductById, updateProduct } from "@/lib/products/product-repo";

const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  slug: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
  price: z.coerce.number().nonnegative().optional(),
  compareAtPrice: z.coerce.number().nonnegative().optional(),
  sku: z.string().optional(),
  currency: z.string().length(3).optional(),
  stockQuantity: z.coerce.number().int().nonnegative().optional(),
  categoryId: z.string().uuid().optional(),
  imageUrl: z.string().url().optional(),
});

const emptyToNull = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const GET = async (_request: Request, { params }: RouteContext) => {
  const access = await requireTenantAccess(["OWNER", "ADMIN", "MEMBER"]);
  if (!access.ok) {
    return NextResponse.json(
      { error: access.reason === "unauthorized" ? "Unauthorized" : "Forbidden" },
      { status: access.reason === "unauthorized" ? 401 : 403 },
    );
  }

  const { id } = await params;
  const context = await getTenantDbContext();
  if (!context) {
    return NextResponse.json({ error: "Tenant not resolved" }, { status: 400 });
  }

  const product = await getProductById(context.db, id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
};

export const PUT = async (request: Request, { params }: RouteContext) => {
  const access = await requireTenantAccess(["OWNER", "ADMIN"]);
  if (!access.ok) {
    return NextResponse.json(
      { error: access.reason === "unauthorized" ? "Unauthorized" : "Forbidden" },
      { status: access.reason === "unauthorized" ? 401 : 403 },
    );
  }

  const { id } = await params;
  const context = await getTenantDbContext();
  if (!context) {
    return NextResponse.json({ error: "Tenant not resolved" }, { status: 400 });
  }

  const raw = await request.json();
  const parsed = productUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updated = await updateProduct(context.db, id, {
    name: parsed.data.name,
    description: parsed.data.description !== undefined ? emptyToNull(parsed.data.description) : undefined,
    slug: parsed.data.slug !== undefined ? emptyToNull(parsed.data.slug) : undefined,
    status: parsed.data.status,
    price: parsed.data.price,
    compareAtPrice: parsed.data.compareAtPrice,
    sku: parsed.data.sku !== undefined ? emptyToNull(parsed.data.sku) : undefined,
    currency: parsed.data.currency,
    stockQuantity: parsed.data.stockQuantity,
    categoryId: parsed.data.categoryId,
    imageUrl: parsed.data.imageUrl,
  });

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product: updated });
};

export const DELETE = async (_request: Request, { params }: RouteContext) => {
  const access = await requireTenantAccess(["OWNER", "ADMIN"]);
  if (!access.ok) {
    return NextResponse.json(
      { error: access.reason === "unauthorized" ? "Unauthorized" : "Forbidden" },
      { status: access.reason === "unauthorized" ? 401 : 403 },
    );
  }

  const { id } = await params;
  const context = await getTenantDbContext();
  if (!context) {
    return NextResponse.json({ error: "Tenant not resolved" }, { status: 400 });
  }

  const deletedId = await deleteProduct(context.db, id);
  if (!deletedId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, id: deletedId });
};

