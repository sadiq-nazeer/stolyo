# Ecommerce roadmap (multi-tenant)

This document tracks the phased buildout of Stolyo’s multi-tenant ecommerce system.

## Decisions locked in
- **Payments (v1)**: Manual/COD first (no Stripe yet).
- **Tenant data access**: Keep **Prisma for global tables**, use a **typed query builder for tenant tables** (avoid raw SQL everywhere in app code).

## Current state (implemented)

### Multi-tenant foundation
- **Host → tenant resolution**:
  - `proxy.ts` sets tenant headers and rewrites tenant `/` → `/storefront`.
  - `lib/tenant/tenant-resolver.ts` resolves tenant by domain/slug.
- **Tenant context**:
  - Prisma tenant client uses per-tenant `search_path` (see `lib/db/tenant-client.ts` + `lib/db/url.ts`).

### Store theming / publish flag
- Tenant table `store_configs` (JSONB) + settings UI at `/store/settings`.

### Phase 1 — Product catalog (DONE)

#### Tenant DB schema
- `prisma/tenant-template.sql` includes product fields:
  - `slug`, `status (draft|active|archived)`, `compare_at_price`, `sku`, `currency`
  - idempotent migration statements + a partial unique index for `slug`
- Migration helper:
  - `scripts/migrate-tenants.ts` re-applies the tenant template for all existing tenants.

#### Tenant DB access layer (typed)
- `lib/db/tenant-db.ts`: Kysely + `pg` with tenant `search_path`, cached per tenant schema.
- `lib/tenant/tenant-db-context.ts`: resolves current tenant → returns `{ tenant, db }`.

#### Product CRUD (tenant-aware)
- API:
  - `GET/POST /api/store/products`
  - `GET/PUT/DELETE /api/store/products/[id]`
- Repo:
  - `lib/products/product-repo.ts` (slug generation + uniqueness, list, create, update, delete)

#### Store dashboard UI
- `/store/products`: list + status badge + edit links
- `/store/products/new`: create form
- `/store/products/[id]`: edit/delete form

#### Storefront
- `/storefront`: renders active products from tenant DB (no fallback sample list)
- `/p/[slug]`: product detail page

## Remaining phases

### Phase 2 — Cart + checkout (manual/COD)
**Goal**: customer can place an order; store can see it.

- **Cart**
  - Session-based cart ID cookie
  - Add-to-cart, cart page, update quantities, remove items
- **Checkout**
  - Collect customer info (email, name, phone) and optional shipping address
  - Create `customers`, `orders`, `order_items` in tenant DB
  - Order confirmation page
- **Order status management**
  - Store can mark: `pending → confirmed → fulfilled → cancelled`

Deliverables:
- Storefront routes: `/cart`, `/checkout`, `/order/[id]`
- Store dashboard routes: `/store/orders`, `/store/orders/[id]`

### Phase 3 — “Complete store operations” essentials
**Goal**: store can run day-to-day operations.

- **Inventory**
  - Standardize when stock decrements (on order creation OR on fulfillment)
- **Customers**
  - `/store/customers` list + customer detail
- **Categories**
  - CRUD under `/store/categories`
- **Basic analytics (tenant)**
  - Cards on `/store`: orders today/week, revenue, top products, conversion placeholder
  - Simple charts later
- **Access control**
  - Keep `OWNER/ADMIN/MEMBER` and enforce per page/action (already present via `requireTenantAccess`)

### Phase 4 — Platform admin + onboarding
**Goal**: manage tenants and onboard smoothly.

- **Platform admin dashboard** (marketing host only)
  - Create tenant (wrap `POST /api/tenants`)
  - View tenants, domains, status (active/suspended)
  - Reset owner password (admin action)
- **Tenant onboarding**
  - First-run checklist: store name/logo, colors, add first product, publish

### Phase 5 — Production-grade upgrades (post-MVP)
- **Payments**: Stripe (or other) with webhooks, refunds, invoices
- **Shipping/taxes**: rates, zones, tax rules
- **Discounts**: coupons, automatic discounts
- **Email**: order confirmation, fulfillment, password reset
- **SEO**: per-tenant sitemap, meta tags, robots, canonical URLs
- **Observability**: request logging, tenant-aware error reporting

## Dashboard UI/UX requirement (IMPORTANT)

### A cohesive dashboard shell (side nav for all sections)
Every store dashboard page should live inside a consistent shell:
- `app/store/layout.tsx` should define:
  - **Side navigation** listing each section (Settings, Products, Orders, Customers, Categories, etc.)
  - A **top bar** (store name, user menu, quick links)
  - A consistent content container (page header + main content)

Status:
- ✅ Implemented in `app/store/layout.tsx` using `components/store-dashboard/store-shell.tsx`
- ✅ Added section placeholders: `/store/orders`, `/store/customers`, `/store/categories`

### Mobile-first / responsive behavior
- Side nav must be **mobile-friendly**:
  - Collapsible drawer on small screens (hamburger button)
  - Keyboard accessible (focus trap when open, ESC to close)
- No dashboard page should require horizontal scrolling on mobile (except intentional tables with overflow containers).

