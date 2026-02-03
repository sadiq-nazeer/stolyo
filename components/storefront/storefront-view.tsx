import { ThemeShell } from "@/components/storefront/theme-shell";
import type { StoreConfig } from "@/lib/store/config";
import { defaultStoreConfig } from "@/lib/store/config";
import Image from "next/image";
import Link from "next/link";

export type StorefrontProduct = {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  slug: string;
};

type StorefrontViewProps = {
  config: StoreConfig;
  products: StorefrontProduct[];
};

const cardSizeClass = "w-[var(--store-card-width)]";
const radiusClass = "rounded-[var(--store-radius)]";

export const StorefrontView = ({ config, products }: StorefrontViewProps) => {
  const sections = config.sections ?? defaultStoreConfig.sections;

  return (
    <ThemeShell config={config}>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-8">
        {sections?.navigation && (
          <nav className="flex items-center justify-between gap-4 border-b pb-4">
            <div className="flex items-center gap-3">
              {config.logoUrl ? (
                <Image
                  src={config.logoUrl}
                  alt="Logo"
                  width={48}
                  height={48}
                  className={`${radiusClass} border object-cover`}
                />
              ) : (
                <div
                  className={`${radiusClass} flex h-12 w-12 items-center justify-center bg-primary text-sm font-semibold text-primary-foreground`}
                >
                  S
                </div>
              )}
              <div className="text-lg font-semibold">Stolyo Demo</div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              {(config.customLinks ?? []).map((link) => (
                <Link
                  key={link.url}
                  href={link.url}
                  className="rounded-full px-3 py-2 hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}

        {sections?.hero && (
          <header
            className={`${radiusClass} relative overflow-hidden border bg-gradient-to-r from-primary/10 via-accent/10 to-background p-8`}
          >
            <div className="max-w-xl space-y-3">
              <p className="text-sm uppercase tracking-wide text-muted-foreground">
                Customizable storefront
              </p>
              <h1 className="text-3xl font-semibold sm:text-4xl">
                Hero/header section with tenant-configurable imagery & colors.
              </h1>
              <p className="text-muted-foreground">
                Swap logos, hero imagery, card sizing, button sizing, and
                radii—all driven by per-tenant JSONB configs.
              </p>
              <div className="flex gap-3">
                <button
                  className={`${radiusClass} bg-[var(--store-primary)] px-4 py-2 text-sm font-medium text-primary-foreground shadow`}
                  style={{ height: "var(--store-button-height)" }}
                >
                  Primary CTA
                </button>
                <button
                  className={`${radiusClass} border px-4 py-2 text-sm font-medium`}
                  style={{ height: "var(--store-button-height)" }}
                >
                  Secondary CTA
                </button>
              </div>
            </div>
            {config.headerImageUrl ? (
              <Image
                src={config.headerImageUrl}
                alt="Header"
                fill
                className="absolute inset-0 -z-10 object-cover opacity-30"
              />
            ) : null}
          </header>
        )}

        {sections?.newArrivals && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">New arrivals</h2>
              <Link className="text-sm text-primary" href="#">
                View all
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {products.slice(0, 2).map((product) => (
                <article
                  key={product.id}
                  className={`${cardSizeClass} ${radiusClass} overflow-hidden border bg-card shadow-sm`}
                >
                  <div className="relative h-40 w-full">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-2 p-3">
                    <div className="text-sm font-semibold">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.currency} {product.price.toFixed(2)}
                    </div>
                    <button
                      className={`${radiusClass} w-full bg-[var(--store-primary)] px-3 text-sm font-medium text-primary-foreground`}
                      style={{ height: "var(--store-button-height)" }}
                    >
                      Add to cart
                    </button>
                    <Link
                      href={`/p/${product.slug}`}
                      className={`${radiusClass} block w-full border px-3 py-2 text-center text-sm font-medium`}
                      style={{ height: "var(--store-button-height)" }}
                    >
                      Details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {sections?.products && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Products</h2>
              <Link className="text-sm text-primary" href="#">
                Explore catalog
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product.id}
                  className={`${radiusClass} overflow-hidden border bg-card shadow-sm`}
                  style={{ width: "100%" }}
                >
                  <div className="relative h-44 w-full">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-2 p-3">
                    <div className="text-sm font-semibold">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.currency} {product.price.toFixed(2)}
                    </div>
                    <div className="flex gap-2">
                      <button
                        className={`${radiusClass} flex-1 bg-[var(--store-primary)] px-3 text-sm font-medium text-primary-foreground`}
                        style={{ height: "var(--store-button-height)" }}
                      >
                        Add
                      </button>
                      <Link
                        href={`/p/${product.slug}`}
                        className={`${radiusClass} flex-1 border px-3 text-center text-sm font-medium`}
                        style={{ height: "var(--store-button-height)" }}
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </ThemeShell>
  );
};

