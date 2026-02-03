"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

type TenantLookupPayload =
  | { ok: true; redirectUrl: string }
  | { ok: false; error: "unauthorized" | "no_tenant" };

const normalizeRedirectPath = (raw: string | null) => {
  if (!raw) return "/store";
  if (!raw.startsWith("/")) return "/store";
  // Prevent open redirects; only allow store area paths to be supplied.
  if (raw === "/store" || raw.startsWith("/store/")) return raw;
  return "/store";
};

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const targetPath = normalizeRedirectPath(callbackUrl) || "/store";
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!email.trim() || !password) {
      setFormError("Email and password are required.");
      return;
    }
    setIsPending(true);
    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        callbackUrl: targetPath,
        redirect: false,
      });
      if (result?.error) {
        setFormError("Invalid email or password.");
        setIsPending(false);
      } else if (result?.ok) {
        const response = await fetch(
          `/api/me/tenant?path=${encodeURIComponent(targetPath)}`,
          { method: "GET" },
        );
        const payload = (await response.json()) as TenantLookupPayload;

        if (!response.ok || !payload.ok) {
          setFormError(
            payload && !payload.ok && payload.error === "no_tenant"
              ? "Your account is not assigned to a store yet."
              : "Could not redirect to your store. Please try again.",
          );
          setIsPending(false);
          return;
        }

        window.location.assign(payload.redirectUrl);
      } else {
        setIsPending(false);
      }
    } catch {
      setFormError("Something went wrong. Please try again.");
      setIsPending(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <div className="space-y-6 rounded-2xl border bg-card/60 p-6 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Use your email and password to access your store dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(error === "CredentialsSignin" || formError) && (
            <p
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {formError ?? "Invalid email or password."}
            </p>
          )}

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border px-3 py-2"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border px-3 py-2"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90 disabled:opacity-60"
          >
            {isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          After seeding, use the demo account (see README or seed output).
        </p>
        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="underline hover:no-underline">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
          <div className="rounded-2xl border bg-card/60 p-6 shadow-sm">
            <p className="text-center text-muted-foreground">Loading…</p>
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
