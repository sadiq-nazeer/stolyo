import { requireTenantAccess } from "@/lib/tenant/access";
import { notFound, redirect } from "next/navigation";
import { ProductForm } from "@/app/store/products/product-form";

export default async function NewProductPage() {
  const access = await requireTenantAccess(["OWNER", "ADMIN"]);
  if (!access.ok) {
    if (access.reason === "unauthorized") redirect("/login");
    return notFound();
  }

  return (
    <ProductForm />
  );
}

