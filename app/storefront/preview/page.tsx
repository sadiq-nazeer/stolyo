import {
    StorefrontView,
    type StorefrontProduct,
} from "@/components/storefront/storefront-view";
import { listProducts } from "@/lib/products/product-repo";
import { defaultStoreConfig } from "@/lib/store/config";
import { loadStoreConfig } from "@/lib/store/config-service";
import { requireTenantAccess } from "@/lib/tenant/access";
import { getTenantDbContext } from "@/lib/tenant/tenant-db-context";
import { notFound, redirect } from "next/navigation";

export default async function StorefrontPreviewPage() {
  const access = await requireTenantAccess(["OWNER", "ADMIN", "MEMBER"]);
  if (!access.ok) {
    if (access.reason === "unauthorized") {
      redirect("/login");
    }
    return notFound();
  }

  const config = (await loadStoreConfig()) ?? defaultStoreConfig;

  const ctx = await getTenantDbContext();
  if (!ctx) return notFound();

  const rows = await listProducts(ctx.db);
  const products: StorefrontProduct[] = rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug ?? p.id,
    price: Number(p.price),
    currency: p.currency,
    image: p.image_url ?? "/placeholder.svg",
  }));

  return (
    <StorefrontView config={config} products={products} />
  );
}
