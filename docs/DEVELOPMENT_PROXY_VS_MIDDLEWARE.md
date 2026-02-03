## Next.js 16+: `proxy.ts` vs `middleware.ts` (important)

This repo uses **Next.js 16.1+**. In this version, the framework has moved from the classic middleware convention to **`proxy.ts`**.

### Symptoms
Running `pnpm dev` fails with messages like:

- `The "middleware" file convention is deprecated. Please use "proxy" instead.`
- `Both middleware file "./middleware.ts" and proxy file "./proxy.ts" are detected. Please use "./proxy.ts" only.`

### Root cause
Both of these files exist at the repo root:
- `proxy.ts`
- `middleware.ts`

Next.js detects both and **refuses to start**. The framework expects **only `proxy.ts`**.

### Fix
- **Do not add `middleware.ts`** in this project.
- Keep all hostname parsing, header injection, and request rewrites in **`proxy.ts`**.

### Our pattern in this repo
`proxy.ts` is responsible for:
- Setting `x-tenant-hostname` (used by `lib/tenant/request-context.ts`)
- Setting `x-tenant-subdomain` (optional convenience)
- Rewriting tenant-domain `/` → `/storefront` so storefronts live at the root of tenant domains

If you need to change tenant routing logic, edit:
- `proxy.ts`

If you need to change how hosts resolve to tenants, edit:
- `lib/tenant/tenant-resolver.ts`

