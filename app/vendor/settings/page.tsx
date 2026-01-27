import { SettingsForm } from "@/app/vendor/settings/settings-form";
import { defaultStoreConfig } from "@/lib/store/config";
import { loadStoreConfig } from "@/lib/store/config-service";

export default async function VendorSettingsPage() {
  const config = (await loadStoreConfig()) ?? defaultStoreConfig;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
      <SettingsForm initialConfig={config} />
    </main>
  );
}
