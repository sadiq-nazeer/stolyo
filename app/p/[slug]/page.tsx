import { defaultStoreConfig } from "@/lib/store/config";
import { loadStoreConfig } from "@/lib/store/config-service";
import { getTenantDbContext } from "@/lib/tenant/tenant-db-context";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProductBySlug } from "@/lib/products/product-repo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const config = (await loadStoreConfig()) ?? defaultStoreConfig;
  if (!config.published) notFound();

  const ctx = await getTenantDbContext();
  if (!ctx) notFound();

  const product = await getProductBySlug(ctx.db, slug);
  if (!product || product.status !== "active") notFound();

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
      <div>
        <Link
          href="/"
          className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted/60"
        >
          ← Back
        </Link>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border bg-card/60 shadow-sm">
          <div className="relative aspect-square w-full">
            <Image
              src={product.image_url ?? "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold">{product.name}</h1>
            <div className="text-lg text-muted-foreground">
              {product.currency} {Number(product.price).toFixed(2)}
            </div>
          </div>

          {product.description ? (
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {product.description}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90">
              Add to cart (next)
            </button>
            <span className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
              Stock: {product.stock_quantity}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

