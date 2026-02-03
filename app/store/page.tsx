import { requireTenantAccess } from "@/lib/tenant/access";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function StoreDashboardPage() {
  const access = await requireTenantAccess(["OWNER", "ADMIN", "MEMBER"]);
  if (!access.ok) {
    if (access.reason === "unauthorized") {
      redirect("/login");
    }
    return notFound();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Quick overview (analytics come next).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/store/products/new"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90"
          >
            New product
          </Link>
          <Link
            href="/store/settings"
            className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted/60"
          >
            Settings
          </Link>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Orders" value="—" hint="Phase 2" />
        <StatCard label="Products" value="—" hint="Phase 1" />
        <StatCard label="Revenue" value="—" hint="Phase 2" />
        <StatCard label="Customers" value="—" hint="Phase 3" />
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card/60 p-6 shadow-sm">
          <div className="text-sm font-semibold">Next steps</div>
          <p className="pt-2 text-sm text-muted-foreground">
            Add products, publish your storefront, then enable cart + checkout.
          </p>
          <div className="flex flex-wrap gap-2 pt-4">
            <Link
              href="/store/products"
              className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-muted/60"
            >
              Manage products
            </Link>
            <Link
              href="/storefront/preview"
              className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-muted/60"
            >
              Preview storefront
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border bg-card/60 p-6 shadow-sm">
          <div className="text-sm font-semibold">Store details</div>
          <p className="pt-2 text-sm text-muted-foreground">
            You’re managing: <span className="font-medium">{access.tenantName}</span>
          </p>
          <p className="pt-1 text-xs text-muted-foreground">
            Tip: keep every dashboard page mobile friendly and responsive.
          </p>
        </div>
      </section>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
};

const StatCard = ({ label, value, hint }: StatCardProps) => (
  <div className="rounded-2xl border bg-card/60 p-5 shadow-sm">
    <div className="text-sm text-muted-foreground">{label}</div>
    <div className="pt-2 text-2xl font-semibold">{value}</div>
    {hint ? (
      <div className="pt-2 text-xs text-muted-foreground">{hint}</div>
    ) : null}
  </div>
);

