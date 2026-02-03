import { requireTenantAccess } from "@/lib/tenant/access";
import { notFound, redirect } from "next/navigation";

export default async function StoreCategoriesPage() {
  const access = await requireTenantAccess(["OWNER", "ADMIN", "MEMBER"]);
  if (!access.ok) {
    if (access.reason === "unauthorized") redirect("/login");
    return notFound();
  }

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-2xl font-semibold">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Category management is coming next (Phase 3).
        </p>
      </div>

      <div className="rounded-2xl border bg-card/60 p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Placeholder page to reserve the navigation and layout for Categories.
        </p>
      </div>
    </div>
  );
}

