import { SettingsForm } from "@/app/vendor/settings/settings-form";
import { defaultStoreConfig } from "@/lib/store/config";
import { loadStoreConfig } from "@/lib/store/config-service";
import { requireTenantAccess } from "@/lib/tenant/access";
import { notFound, redirect } from "next/navigation";

export default async function VendorSettingsPage() {
  const access = await requireTenantAccess(["OWNER", "ADMIN"]);
  if (!access.ok) {
    if (access.reason === "unauthorized") {
      redirect("/login");
    }
    return notFound();
  }

  const config = (await loadStoreConfig()) ?? defaultStoreConfig;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
      <SettingsForm initialConfig={config} />
    </main>
  );
}
