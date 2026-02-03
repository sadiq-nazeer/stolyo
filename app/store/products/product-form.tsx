"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  slug: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]),
  price: z.coerce.number().nonnegative(),
  compareAtPrice: z.coerce.number().nonnegative().optional(),
  currency: z.string().length(3).default("USD"),
  stockQuantity: z.coerce.number().int().nonnegative().default(0),
  sku: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

type ProductFormInitial = {
  id?: string;
  name?: string;
  description?: string | null;
  slug?: string | null;
  status?: "draft" | "active" | "archived";
  price?: string;
  compare_at_price?: string | null;
  currency?: string;
  stock_quantity?: number;
  sku?: string | null;
  image_url?: string | null;
};

type UploadResponse = {
  uploadUrl: string;
  assetUrl: string;
};

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ProductForm = ({ initial }: { initial?: ProductFormInitial }) => {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const defaults = useMemo<FormValues>(
    () => ({
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      slug: initial?.slug ?? "",
      status: initial?.status ?? "draft",
      price: initial?.price ? Number(initial.price) : 0,
      compareAtPrice: initial?.compare_at_price
        ? Number(initial.compare_at_price)
        : undefined,
      currency: (initial?.currency ?? "USD").toUpperCase(),
      stockQuantity: initial?.stock_quantity ?? 0,
      sku: initial?.sku ?? "",
      imageUrl: initial?.image_url ?? "",
    }),
    [initial],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaults,
  });

  const uploadProductImage = async (file: File): Promise<string> => {
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error("File is too large (max 5MB)");
    }

    const response = await fetch("/api/uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        assetType: "product",
        size: file.size,
      }),
    });

    const payload = (await response.json()) as UploadResponse | { error?: string };
    if (!response.ok) {
      const errorMessage = "error" in payload ? payload.error : undefined;
      throw new Error(errorMessage ?? "Failed to start upload");
    }

    if (!("uploadUrl" in payload) || !("assetUrl" in payload)) {
      throw new Error("Upload response was invalid");
    }

    const uploadResult = await fetch(payload.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!uploadResult.ok) {
      throw new Error("Upload failed");
    }

    return payload.assetUrl;
  };

  const onSubmit = (values: FormValues) => {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      try {
        const payload = {
          name: values.name,
          description: values.description?.trim() || undefined,
          slug: values.slug?.trim() || undefined,
          status: values.status,
          price: values.price,
          compareAtPrice: values.compareAtPrice,
          currency: values.currency.trim().toUpperCase(),
          stockQuantity: values.stockQuantity,
          sku: values.sku?.trim() || undefined,
          imageUrl: values.imageUrl?.trim() || undefined,
        };

        const isEdit = Boolean(initial?.id);
        const endpoint = isEdit ? `/api/store/products/${initial!.id}` : "/api/store/products";
        const method = isEdit ? "PUT" : "POST";

        const res = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = (await res.json()) as { product?: { id: string }; error?: string };
        if (!res.ok) {
          throw new Error(data.error ?? "Failed to save product");
        }

        setMessage(isEdit ? "Product updated" : "Product created");
        router.refresh();
        if (!isEdit && data.product?.id) {
          router.push(`/store/products/${data.product.id}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save product");
      }
    });
  };

  const handleDelete = () => {
    if (!initial?.id) return;
    setMessage(null);
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/store/products/${initial.id}`, {
          method: "DELETE",
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok) {
          throw new Error(data.error ?? "Failed to delete product");
        }
        router.push("/store/products");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete product");
      }
    });
  };

  const handleFilePick = async (file?: File) => {
    if (!file) return;
    setMessage(null);
    setError(null);
    setIsUploading(true);
    try {
      const url = await uploadProductImage(file);
      form.setValue("imageUrl", url);
      setMessage("Image uploaded");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6 rounded-2xl border bg-card/60 p-6 shadow-sm"
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">
          {initial?.id ? "Edit product" : "New product"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Draft products are hidden from the storefront until activated.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" error={form.formState.errors.name?.message}>
          <input className="w-full rounded-md border px-3 py-2" {...form.register("name")} />
        </Field>

        <Field label="Status">
          <select className="w-full rounded-md border px-3 py-2" {...form.register("status")}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </Field>

        <Field label="Price" error={form.formState.errors.price?.message}>
          <input
            type="number"
            step="0.01"
            className="w-full rounded-md border px-3 py-2"
            {...form.register("price")}
          />
        </Field>

        <Field label="Compare at price" error={form.formState.errors.compareAtPrice?.message}>
          <input
            type="number"
            step="0.01"
            className="w-full rounded-md border px-3 py-2"
            {...form.register("compareAtPrice")}
          />
        </Field>

        <Field label="Currency (3 letters)" error={form.formState.errors.currency?.message}>
          <input className="w-full rounded-md border px-3 py-2" {...form.register("currency")} />
        </Field>

        <Field label="Stock quantity" error={form.formState.errors.stockQuantity?.message}>
          <input
            type="number"
            step="1"
            className="w-full rounded-md border px-3 py-2"
            {...form.register("stockQuantity")}
          />
        </Field>

        <Field label="SKU">
          <input className="w-full rounded-md border px-3 py-2" {...form.register("sku")} />
        </Field>

        <Field label="Slug (optional)">
          <input className="w-full rounded-md border px-3 py-2" {...form.register("slug")} />
          <p className="text-xs text-muted-foreground">
            Leave blank to auto-generate from the name.
          </p>
        </Field>

        <Field label="Image URL" error={form.formState.errors.imageUrl?.message}>
          <input
            type="url"
            placeholder="https://..."
            className="w-full rounded-md border px-3 py-2"
            {...form.register("imageUrl")}
          />
          <input
            type="file"
            accept="image/*"
            className="mt-2 w-full text-sm"
            onChange={(event) => void handleFilePick(event.target.files?.[0])}
          />
          {isUploading && (
            <span className="text-xs text-muted-foreground">Uploading image...</span>
          )}
        </Field>

        <Field label="Description" className="md:col-span-2">
          <textarea
            rows={5}
            className="w-full rounded-md border px-3 py-2"
            {...form.register("description")}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save product"}
        </button>

        {initial?.id && (
          <button
            type="button"
            disabled={isPending}
            onClick={handleDelete}
            className="rounded-md border px-4 py-2 text-sm font-semibold hover:bg-muted/60 disabled:opacity-60"
          >
            Delete
          </button>
        )}

        {message && <span className="text-sm text-green-600">{message}</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
};

const Field = ({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <label className={`flex flex-col gap-1 text-sm ${className ?? ""}`}>
    <span className="font-medium">{label}</span>
    {children}
    {error && <span className="text-xs text-red-600">{error}</span>}
  </label>
);

