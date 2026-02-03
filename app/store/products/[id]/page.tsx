import { requireTenantAccess } from "@/lib/tenant/access";
import { notFound, redirect } from "next/navigation";
import { ProductForm } from "@/app/store/products/product-form";
import { getTenantDbContext } from "@/lib/tenant/tenant-db-context";
import { getProductById } from "@/lib/products/product-repo";
import Link from "next/link";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: PageProps) {
  const access = await requireTenantAccess(["OWNER", "ADMIN"]);
  if (!access.ok) {
    if (access.reason === "unauthorized") redirect("/login");
    return notFound();
  }

  const { id } = await params;
  const context = await getTenantDbContext();
  if (!context) return notFound();

  const product = await getProductById(context.db, id);
  if (!product) return notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link
          href="/store/products"
          className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-muted/60"
        >
          ← Back to products
        </Link>
      </div>
      <ProductForm initial={product} />
    </div>
  );
}

