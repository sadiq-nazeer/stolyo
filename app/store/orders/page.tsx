import { requireTenantAccess } from "@/lib/tenant/access";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function StoreOrdersPage() {
  const access = await requireTenantAccess(["OWNER", "ADMIN", "MEMBER"]);
  if (!access.ok) {
    if (access.reason === "unauthorized") redirect("/login");
    return notFound();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Order management is coming next (Phase 2).
          </p>
        </div>
        <Link
          href="/store/products"
          className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-muted/60"
        >
          Go to products
        </Link>
      </div>

      <div className="rounded-2xl border bg-card/60 p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Placeholder page to reserve the navigation and layout for Orders.
        </p>
      </div>
    </div>
  );
}

