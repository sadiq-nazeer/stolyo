"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

type NavItem = {
  label: string;
  href: string;
  description?: string;
  disabled?: boolean;
};

const isActive = (pathname: string, href: string) => {
  if (href === "/store") return pathname === "/store";
  return pathname === href || pathname.startsWith(`${href}/`);
};

const classNames = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

export const StoreShell = ({
  tenantName,
  children,
}: {
  tenantName: string;
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = useMemo(
    () => [
      { label: "Dashboard", href: "/store", description: "Overview & analytics" },
      { label: "Products", href: "/store/products", description: "Catalog & inventory" },
      { label: "Orders", href: "/store/orders", description: "Manage orders" },
      { label: "Customers", href: "/store/customers", description: "Customer list" },
      { label: "Categories", href: "/store/categories", description: "Organize products" },
      { label: "Settings", href: "/store/settings", description: "Theme & storefront" },
      { label: "Preview storefront", href: "/storefront/preview", description: "See changes live" },
    ],
    [],
  );

  const Nav = ({ variant }: { variant: "desktop" | "mobile" }) => (
    <nav className={classNames(variant === "mobile" ? "p-4" : "p-3")}>
      <div className="px-2 pb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Store
      </div>
      <div className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          const base =
            "rounded-xl border px-3 py-2 text-sm transition-colors";
          const activeClass = "bg-primary text-primary-foreground border-primary/20";
          const inactiveClass = "hover:bg-muted/60 bg-card/40";
          const disabledClass = "opacity-60 pointer-events-none";

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={classNames(
                base,
                active ? activeClass : inactiveClass,
                item.disabled && disabledClass,
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{item.label}</span>
                {active && (
                  <span className="text-[10px] font-semibold opacity-90">
                    Active
                  </span>
                )}
              </div>
              {item.description && (
                <div
                  className={classNames(
                    "text-xs",
                    active ? "text-primary-foreground/80" : "text-muted-foreground",
                  )}
                >
                  {item.description}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-card/60 md:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <span className="text-lg leading-none">≡</span>
            </button>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight">
                {tenantName}
              </span>
              <span className="text-xs text-muted-foreground">
                Store dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden rounded-xl border px-3 py-2 text-sm font-medium hover:bg-muted/60 sm:inline-flex"
            >
              View storefront
            </Link>
            <Link
              href="/storefront/preview"
              className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90"
            >
              Preview
            </Link>
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[280px_1fr] md:gap-6">
        {/* Desktop sidebar */}
        <aside className="sticky top-[68px] hidden h-[calc(100vh-76px)] overflow-y-auto rounded-2xl border bg-card/30 shadow-sm md:block">
          <Nav variant="desktop" />
        </aside>

        <main className="min-w-0">
          <div className="rounded-2xl border bg-card/30 shadow-sm">
            <div className="p-4 sm:p-6">{children}</div>
          </div>
        </main>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-xs overflow-y-auto border-r bg-background shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <div className="text-sm font-semibold">{tenantName}</div>
              <button
                type="button"
                className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-muted/60"
                onClick={() => setMobileOpen(false)}
              >
                Close
              </button>
            </div>
            <Nav variant="mobile" />
          </div>
        </div>
      )}
    </div>
  );
};

