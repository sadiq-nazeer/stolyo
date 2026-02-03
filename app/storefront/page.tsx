import {
  StorefrontView,
  type StorefrontProduct,
} from "@/components/storefront/storefront-view";
import { listActiveStorefrontProducts } from "@/lib/products/product-repo";
import { defaultStoreConfig } from "@/lib/store/config";
import { loadStoreConfig } from "@/lib/store/config-service";
import { getTenantDbContext } from "@/lib/tenant/tenant-db-context";
import { notFound } from "next/navigation";

export default async function StorefrontPage() {
  const config = (await loadStoreConfig()) ?? defaultStoreConfig;
  if (!config.published) {
    notFound();
  }

  const ctx = await getTenantDbContext();
  if (!ctx) notFound();

  const rows = await listActiveStorefrontProducts(ctx.db);
  const products: StorefrontProduct[] = rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug ?? p.id,
    price: Number(p.price),
    currency: p.currency,
    image: p.image_url ?? "/placeholder.svg",
  }));

  return <StorefrontView config={config} products={products} />;
}

