import Link from "next/link";

const features = [
  "Schema-per-tenant PostgreSQL isolation",
  "NextAuth 5 JWT auth",
  "Storefront theming via JSONB configs",
  "Wildcard subdomains for tenant stores",
];

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-12 px-6 py-16">
      <header className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Stolyo SaaS
        </p>
        <h1 className="text-4xl font-semibold sm:text-5xl">
          Build customizable storefronts per tenant
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Next.js 16 app router, schema-per-tenant PostgreSQL, NextAuth 5, and
          a clean multi-tenant foundation—ready for subdomains, theming, and
          future custom domains.
        </p>
      </header>

      <section className="grid gap-6 rounded-2xl border bg-card/60 p-6 shadow-sm sm:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">What&apos;s included</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {features.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 rounded-lg border border-dashed border-border/60 bg-muted/40 px-3 py-2"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Next steps</h2>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>1) Wire tenant resolution & per-request search_path.</li>
            <li>2) Implement store config JSONB + theme tokens.</li>
            <li>3) Add vendor settings & storefront layouts.</li>
            <li>4) Replace Supabase with Prisma + NextAuth.</li>
            <li>5) Add CI/CD and production hardening.</li>
          </ol>
          <div className="flex gap-3 pt-2">
            <Link
              href="/vendor/settings"
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90"
            >
              Go to vendor settings
            </Link>
            <Link
              href="/storefront/preview"
              className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-muted/70"
            >
              Preview storefront
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
