import { StoreShell } from "@/components/store-dashboard/store-shell";
import { requireTenantAccess } from "@/lib/tenant/access";
import { notFound, redirect } from "next/navigation";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await requireTenantAccess(["OWNER", "ADMIN", "MEMBER"]);
  if (!access.ok) {
    if (access.reason === "unauthorized") redirect("/login");
    return notFound();
  }

  return <StoreShell tenantName={access.tenantName}>{children}</StoreShell>;
}

