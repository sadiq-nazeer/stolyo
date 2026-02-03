import { SettingsForm } from "@/app/store/settings/settings-form";
import { defaultStoreConfig } from "@/lib/store/config";
import { loadStoreConfig } from "@/lib/store/config-service";
import { requireTenantAccess } from "@/lib/tenant/access";
import { notFound, redirect } from "next/navigation";

export default async function StoreSettingsPage() {
  const access = await requireTenantAccess(["OWNER", "ADMIN"]);
  if (!access.ok) {
    if (access.reason === "unauthorized") {
      redirect("/login");
    }
    return notFound();
  }

  const config = (await loadStoreConfig()) ?? defaultStoreConfig;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Control logo, imagery, colors, sizing, links, and storefront visibility.
        </p>
      </div>
      <SettingsForm initialConfig={config} />
    </div>
  );
}
