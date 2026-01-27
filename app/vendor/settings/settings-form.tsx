"use client";

import type { StoreConfig } from "@/lib/store/config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { upsertStoreConfig } from "./actions";

const formSchema = z.object({
  logoUrl: z.string().url().optional().or(z.literal("")),
  headerImageUrl: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  itemCardSize: z.enum(["small", "medium", "large"]),
  buttonSize: z.enum(["sm", "md", "lg"]),
  borderRadius: z.enum(["none", "sm", "md", "lg", "xl"]),
  customLinksText: z.string().optional(),
  sectionsNavigation: z.boolean().default(true),
  sectionsHero: z.boolean().default(true),
  sectionsNewArrivals: z.boolean().default(true),
  sectionsProducts: z.boolean().default(true),
  sectionsFeatured: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const linksToText = (links: StoreConfig["customLinks"]) =>
  links.map((link) => `${link.label}|${link.url}`).join("\n");

const textToLinks = (text?: string): StoreConfig["customLinks"] => {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [label, url] = line.split("|").map((part) => part.trim());
      return { label, url };
    })
    .filter((link) => link.label && link.url);
};

type SettingsFormProps = {
  initialConfig: StoreConfig;
};

export const SettingsForm = ({ initialConfig }: SettingsFormProps) => {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      logoUrl: initialConfig.logoUrl ?? "",
      headerImageUrl: initialConfig.headerImageUrl ?? "",
      primaryColor: initialConfig.primaryColor ?? "",
      accentColor: initialConfig.accentColor ?? "",
      itemCardSize: initialConfig.itemCardSize,
      buttonSize: initialConfig.buttonSize,
      borderRadius: initialConfig.borderRadius,
      customLinksText: linksToText(initialConfig.customLinks),
      sectionsNavigation: initialConfig.sections?.navigation ?? true,
      sectionsHero: initialConfig.sections?.hero ?? true,
      sectionsNewArrivals: initialConfig.sections?.newArrivals ?? true,
      sectionsProducts: initialConfig.sections?.products ?? true,
      sectionsFeatured: initialConfig.sections?.featured ?? true,
    },
  });

  const onSubmit = (values: FormValues) => {
    setMessage(null);
    setError(null);
    const config: StoreConfig = {
      logoUrl: values.logoUrl || undefined,
      headerImageUrl: values.headerImageUrl || undefined,
      primaryColor: values.primaryColor || undefined,
      accentColor: values.accentColor || undefined,
      itemCardSize: values.itemCardSize,
      buttonSize: values.buttonSize,
      borderRadius: values.borderRadius,
      customLinks: textToLinks(values.customLinksText),
      sections: {
        navigation: values.sectionsNavigation,
        hero: values.sectionsHero,
        newArrivals: values.sectionsNewArrivals,
        products: values.sectionsProducts,
        featured: values.sectionsFeatured,
      },
    };

    startTransition(async () => {
      try {
        await upsertStoreConfig(config);
        setMessage("Settings saved");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save settings");
      }
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6 rounded-2xl border bg-card/60 p-6 shadow-sm"
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Store settings</h1>
        <p className="text-sm text-muted-foreground">
          Control logo, imagery, colors, sizing, radii, links, and section
          visibility for this tenant.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Logo URL"
          description="Displayed in navigation."
          error={form.formState.errors.logoUrl?.message}
        >
          <input
            type="url"
            placeholder="https://example.com/logo.png"
            className="w-full rounded-md border px-3 py-2"
            {...form.register("logoUrl")}
          />
        </Field>

        <Field
          label="Header image URL"
          description="Hero background image."
          error={form.formState.errors.headerImageUrl?.message}
        >
          <input
            type="url"
            placeholder="https://example.com/header.jpg"
            className="w-full rounded-md border px-3 py-2"
            {...form.register("headerImageUrl")}
          />
        </Field>

        <Field label="Primary color" description="CSS color or hex code.">
          <input
            type="text"
            placeholder="#0f172a or hsl(210 40% 98%)"
            className="w-full rounded-md border px-3 py-2"
            {...form.register("primaryColor")}
          />
        </Field>

        <Field label="Accent color" description="CSS color or hex code.">
          <input
            type="text"
            placeholder="#818cf8"
            className="w-full rounded-md border px-3 py-2"
            {...form.register("accentColor")}
          />
        </Field>

        <Field label="Item card size">
          <select
            className="w-full rounded-md border px-3 py-2"
            {...form.register("itemCardSize")}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </Field>

        <Field label="Button size">
          <select
            className="w-full rounded-md border px-3 py-2"
            {...form.register("buttonSize")}
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </Field>

        <Field label="Border radius">
          <select
            className="w-full rounded-md border px-3 py-2"
            {...form.register("borderRadius")}
          >
            <option value="none">None</option>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="xl">XL</option>
          </select>
        </Field>

        <Field
          label="Custom links"
          description="One per line: Label|https://url"
          error={form.formState.errors.customLinksText?.message}
        >
          <textarea
            className="w-full rounded-md border px-3 py-2"
            rows={4}
            placeholder="About|https://example.com/about"
            {...form.register("customLinksText")}
          />
        </Field>
      </div>

      <div className="grid gap-2 rounded-xl border bg-muted/40 p-4">
        <p className="text-sm font-semibold">Sections</p>
        <Toggle
          label="Navigation"
          checked={form.watch("sectionsNavigation")}
          onChange={(value) => form.setValue("sectionsNavigation", value)}
        />
        <Toggle
          label="Hero/Header"
          checked={form.watch("sectionsHero")}
          onChange={(value) => form.setValue("sectionsHero", value)}
        />
        <Toggle
          label="New arrivals"
          checked={form.watch("sectionsNewArrivals")}
          onChange={(value) => form.setValue("sectionsNewArrivals", value)}
        />
        <Toggle
          label="Products"
          checked={form.watch("sectionsProducts")}
          onChange={(value) => form.setValue("sectionsProducts", value)}
        />
        <Toggle
          label="Featured"
          checked={form.watch("sectionsFeatured")}
          onChange={(value) => form.setValue("sectionsFeatured", value)}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save settings"}
        </button>
        {message && <span className="text-sm text-green-600">{message}</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
};

type FieldProps = {
  label: string;
  description?: string;
  error?: string;
  children: React.ReactNode;
};

const Field = ({ label, description, error, children }: FieldProps) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="font-medium">{label}</span>
    {description && (
      <span className="text-xs text-muted-foreground">{description}</span>
    )}
    {children}
    {error && <span className="text-xs text-red-600">{error}</span>}
  </label>
);

type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const Toggle = ({ label, checked, onChange }: ToggleProps) => (
  <label className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
    <span>{label}</span>
    <input
      type="checkbox"
      className="h-4 w-4"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
    />
  </label>
);
