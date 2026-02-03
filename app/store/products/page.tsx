import { requireTenantAccess } from "@/lib/tenant/access";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getTenantDbContext } from "@/lib/tenant/tenant-db-context";
import { listProducts } from "@/lib/products/product-repo";

const statusBadgeClass = (status: string) => {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "archived":
      return "bg-zinc-100 text-zinc-700 border-zinc-200";
    default:
      return "bg-amber-100 text-amber-700 border-amber-200";
  }
};

export default async function StoreProductsPage() {
  const access = await requireTenantAccess(["OWNER", "ADMIN", "MEMBER"]);
  if (!access.ok) {
    if (access.reason === "unauthorized") redirect("/login");
    return notFound();
  }

  const context = await getTenantDbContext();
  if (!context) return notFound();

  const products = await listProducts(context.db);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage products for your storefront.
          </p>
        </div>
        <Link
          href="/store/products/new"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90"
        >
          New product
        </Link>
      </header>

      <section className="rounded-2xl border bg-card/60 shadow-sm">
        {products.length === 0 ? (
          <div className="p-6">
            <p className="text-sm text-muted-foreground">No products yet.</p>
            <div className="pt-4">
              <Link
                href="/store/products/new"
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted/60"
              >
                Create your first product
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.slug ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${statusBadgeClass(
                          p.status,
                        )}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.currency} {Number(p.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">{p.stock_quantity}</td>
                    <td className="px-4 py-3">
                      {new Date(p.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/store/products/${p.id}`}
                        className="rounded-md border px-3 py-2 text-xs font-medium hover:bg-muted/60"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

