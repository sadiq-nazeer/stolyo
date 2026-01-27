# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Stolyo** is a multi-tenant SaaS e-commerce platform built with Next.js 14 (App Router), enabling vendors to create fully isolated stores with custom domains/subdomains. The platform uses schema-per-tenant PostgreSQL architecture for complete data isolation.

### Tech Stack Core
- **Next.js 14** with App Router
- **Prisma** for database ORM and migrations
- **NextAuth v5 (beta)** for authentication (JWT + Credentials + Email providers)
- **PostgreSQL** with schema-per-tenant architecture
- **Redis** for Socket.IO adapter and caching
- **Socket.IO** for real-time features
- **TypeScript** with strict mode
- **Tailwind CSS** + **shadcn/ui** (Radix UI primitives)

## Essential Commands

### Development
```powershell
# Install dependencies
pnpm install

# Start development server (runs on http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run ESLint
pnpm lint
```

### Database Management
```powershell
# Generate Prisma Client (required after schema changes)
pnpm prisma generate

# Create and apply a new migration
pnpm prisma migrate dev

# Apply migrations in production
pnpm prisma migrate deploy

# Reset database (WARNING: destroys all data)
pnpm prisma migrate reset

# Open Prisma Studio (database GUI)
pnpm prisma studio
```

### Docker Development
```powershell
# Start all services (PostgreSQL + Redis)
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and start
docker-compose up --build -d
```

### Mobile Development (Capacitor)
```powershell
# Build web assets
pnpm build

# Sync web assets to native projects
npx cap sync

# Open in Xcode (iOS)
npx cap open ios

# Open in Android Studio
npx cap open android
```

## Multi-Tenant Architecture

This is the **most critical architectural concept** in the codebase.

### Schema-per-Tenant Isolation

Each tenant (store) operates in its own PostgreSQL schema, providing complete data isolation:

1. **Main Database**: Contains global tables:
   - `Tenant` - Stores tenant metadata (id, name, slug, schemaName)
   - `Domain` - Maps custom domains/subdomains to tenants
   - `User` - Global user accounts
   - `UserTenant` - Junction table with role-based access (OWNER, ADMIN, MEMBER)
   - `Account`, `Session`, `VerificationToken` - NextAuth tables

2. **Tenant-Specific Schemas**: Each tenant has an isolated schema (e.g., `tenant_abc123`) containing:
   - Store-specific data (products, orders, inventory, etc.)
   - `store_configs` table with JSONB configuration for theming/settings

### How Tenant Resolution Works

The tenant resolution flow spans multiple files and is critical to understand:

1. **`middleware.ts`**: 
   - Extracts subdomain from request hostname
   - Sets `x-tenant-subdomain` and `x-tenant-hostname` headers
   - Runs on every request (except static assets)

2. **`lib/tenant/tenant-resolver.ts`** (`resolveTenantByHost`):
   - Looks up tenant by custom domain in `Domain` table
   - Falls back to slug-based lookup from subdomain
   - Returns `Tenant` object or null

3. **`lib/tenant/request-context.ts`** (`getTenantContext`):
   - Reads hostname from headers (x-forwarded-host, x-tenant-hostname, or host)
   - Calls `resolveTenantByHost` to get tenant
   - Creates/retrieves Prisma client with `search_path` set to tenant's schema
   - Returns `{ tenant, client }` object
   - **Used in Server Components and API routes** to get per-tenant database client

4. **`lib/db/tenant-client.ts`** (`getTenantClient`):
   - Maintains a Map cache of PrismaClient instances keyed by schema name
   - Each client is configured with `search_path` set to tenant schema
   - Prevents connection pool exhaustion by reusing clients

### Important: When to Use Which Client

- **`lib/db/client.ts` (main `prisma` export)**: For queries on global tables (Tenant, Domain, User, UserTenant)
- **`getTenantContext().client`**: For queries on tenant-specific data in Server Components
- **Per-tenant migrations**: Use `lib/db/tenant-migrator.ts` to apply schema changes to all tenant schemas

## Authentication Architecture

### NextAuth v5 Configuration

- **Main config**: `auth.config.ts` - Providers, callbacks, adapter configuration
- **Auth instance**: `auth.ts` - Exports `handlers`, `auth`, `signIn`, `signOut`
- **Auth route**: `app/api/auth/[...nextauth]/route.ts` (must exist for NextAuth handlers)
- **Middleware**: `middleware.ts` handles tenant resolution (auth is separate)

### Providers Configured
1. **Credentials**: Email + password with bcrypt verification
2. **Email (Magic Link)**: Nodemailer-based passwordless login

### Auth Flow
- Session strategy: `jwt` (stateless)
- User ID injected into JWT via `jwt` callback
- Session enriched with user ID via `session` callback
- Protected routes should check `await auth()` for session

## Real-Time Features

### Socket.IO Architecture

- **Server**: `lib/realtime/server.ts`
  - Initializes Socket.IO with Redis adapter for horizontal scaling
  - Room-based architecture: clients join room named after `tenantId`
  - Event: `order-update` broadcasts to all connections in a tenant room
  
- **Client Hook**: `lib/realtime/client.ts` (`useSocket`)
  - Auto-connects to Socket.IO on mount
  - Auto-joins tenant room if `tenantId` provided
  - Returns `{ socket }` for subscribing to events

### Redis Integration
- Required for Socket.IO adapter (enables multi-instance deployments)
- Connection via `REDIS_URL` environment variable
- Pub/sub pattern for cross-instance message delivery

## Store Configuration & Theming

### JSONB Configuration System

- **Config Schema**: `lib/store/config.ts` - TypeScript types for store configuration
- **Config Service**: `lib/store/config-service.ts` (`loadStoreConfig`)
  - Queries `store_configs` table in tenant schema using raw SQL
  - Returns `StoreConfig` object with theme colors, fonts, etc.
  - Falls back to `defaultStoreConfig` if no config exists

### Theme Application

- Storefront pages load config via `loadStoreConfig()`
- Pass config to `StorefrontView` component (`components/storefront/storefront-view.tsx`)
- Theme applied via `ThemeShell` wrapper with CSS variables

## Directory Structure & Conventions

### App Router Pages (`app/`)
- **`page.tsx`**: Landing page (main dashboard or marketing)
- **`layout.tsx`**: Root layout (minimal, just HTML shell)
- **`globals.css`**: Global styles, Tailwind imports, CSS variables
- **`api/`**: API routes
  - `api/auth/[...nextauth]/` - NextAuth handlers
  - `api/tenants/` - Tenant management endpoints
- **`storefront/[slug]/`**: Dynamic storefront pages (per-tenant stores)
- **`vendor/settings/`**: Vendor dashboard settings page

### Library Code (`lib/`)
- **`db/`**: Database clients and utilities
  - `client.ts` - Main Prisma client
  - `tenant-client.ts` - Per-tenant client factory
  - `tenant-migrator.ts` - Migration utilities
  - `url.ts` - Database URL manipulation for search_path
- **`tenant/`**: Multi-tenancy logic
  - `tenant-resolver.ts` - Resolve tenant from hostname
  - `request-context.ts` - Get tenant context in Server Components
- **`realtime/`**: Socket.IO setup
  - `server.ts` - Socket.IO server initialization
  - `client.ts` - React hook for Socket.IO client
- **`store/`**: Store configuration
  - `config.ts` - Type definitions
  - `config-service.ts` - Load/parse store config from DB
- **`env.ts`**: Zod-validated environment variables (fails fast on missing vars)

### Components (`components/`)
- **`storefront/`**: Storefront-specific components
  - `storefront-view.tsx` - Main storefront layout
  - `theme-shell.tsx` - Theme provider wrapper

### Prisma (`prisma/`)
- **`schema.prisma`**: Database schema (single source of truth)
- **`migrations/`**: Migration history (auto-generated, do not edit manually)

## Environment Variables

Required environment variables (defined in `lib/env.ts`):

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/stolyo"

# NextAuth
NEXTAUTH_SECRET="<generate with openssl rand -base64 32>"

# Email Configuration
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="user@example.com"
EMAIL_SERVER_PASSWORD="password"
EMAIL_FROM="noreply@stolyo.com"

# Multi-Tenant Configuration
DASHBOARD_HOST="stolyo.com"  # Main dashboard domain (used to detect subdomains)

# Redis
REDIS_URL="redis://localhost:6379"
```

**Important**: The app will fail to start if any required env var is missing (enforced by Zod schema).

## Database Schema Key Models

### Global Schema (Main Database)
- **`Tenant`**: `{ id, name, slug, schemaName, createdAt, updatedAt }`
- **`Domain`**: `{ id, hostname, isPrimary, tenantId }` - Maps domains to tenants
- **`User`**: `{ id, email, hashedPassword?, name?, image? }`
- **`UserTenant`**: `{ userId, tenantId, role }` - Junction with `TenantRole` enum (OWNER, ADMIN, MEMBER)
- **`Account`, `Session`, `VerificationToken`**: NextAuth standard tables

### Tenant-Specific Schema (Per Tenant)
- Schema name format: Stored in `Tenant.schemaName` (e.g., `tenant_abc123`)
- Contains store-specific tables (products, orders, etc.)
- **`store_configs`**: JSONB configuration for theming

## Development Workflow

### Making Schema Changes

1. Edit `prisma/schema.prisma`
2. Run `pnpm prisma migrate dev --name descriptive_name`
3. Commit both `schema.prisma` and generated migration files
4. For tenant schemas: Use `lib/db/tenant-migrator.ts` to apply migrations to all tenant schemas

### Adding New Features

1. If feature is tenant-specific:
   - Use `getTenantContext()` in Server Components to get tenant client
   - Query using `context.client` instead of main `prisma` client
2. If feature is global (users, tenants, domains):
   - Use main `prisma` client from `lib/db/client.ts`
3. For real-time features:
   - Server: Emit events via Socket.IO to tenant rooms
   - Client: Use `useSocket(tenantId)` hook and subscribe to events

### Server Components vs Client Components

- **Server Components** (default): Can use `await getTenantContext()`, `await auth()`, database queries
- **Client Components** (`"use client"`): Required for:
  - React hooks (useState, useEffect, useSocket, etc.)
  - Event handlers (onClick, onSubmit, etc.)
  - Browser APIs (window, localStorage, etc.)

## Common Patterns

### Accessing Tenant Data in Server Components

```typescript
import { getTenantContext } from "@/lib/tenant/request-context";

export default async function MyPage() {
  const context = await getTenantContext();
  if (!context) {
    return <div>Tenant not found</div>;
  }

  const { tenant, client } = context;
  // Query tenant-specific data
  const products = await client.$queryRaw`SELECT * FROM products`;
  
  return <div>{tenant.name}</div>;
}
```

### Using Authentication

```typescript
import { auth } from "@/auth";

export default async function ProtectedPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  
  // Access user data
  const userId = session.user.id;
}
```

### Real-Time Updates (Client Component)

```typescript
"use client";
import { useSocket } from "@/lib/realtime/client";
import { useEffect } from "react";

export function OrderNotifications({ tenantId }: { tenantId: string }) {
  const { socket } = useSocket(tenantId);
  
  useEffect(() => {
    if (!socket) return;
    
    socket.on("order-update", (data) => {
      console.log("New order:", data);
    });
    
    return () => {
      socket.off("order-update");
    };
  }, [socket]);
  
  return <div>Listening for orders...</div>;
}
```

## Path Aliases

TypeScript paths configured in `tsconfig.json`:
- `@/*` maps to project root (e.g., `@/lib/db/client` → `lib/db/client.ts`)

## Important Notes from AI_RULES.md

While the AI_RULES.md references a React + Vite + React Router setup, the actual codebase uses **Next.js App Router**. The relevant parts that still apply:

- **TypeScript**: Always use TypeScript
- **Tailwind CSS**: Use Tailwind extensively for styling
- **shadcn/ui**: All shadcn/ui components are pre-installed, import from `@/components/ui/*`
- **Lucide React**: Use for icons
- **Component Structure**: 
  - Server Components in `app/` directory (default)
  - Client Components with `"use client"` directive when needed
  - Reusable components in `components/` directory

## Conflicting Documentation Note

The `PROJECT_DOCUMENTATION.md` file describes a **different architecture** (Supabase, Vite, React Router). The actual codebase uses:
- Next.js App Router (not Vite)
- Prisma + PostgreSQL (not Supabase)
- NextAuth (not Supabase Auth)
- Socket.IO (not Supabase Realtime)

**Always refer to the actual code and this WARP.md when making decisions.**

## Deployment Considerations

- **Vercel**: Configured via `vercel.json` (SPA routing for static exports)
- **Docker**: Multi-service setup in `docker-compose.yml` for local development
- **Mobile**: Capacitor configured for iOS/Android builds (see Mobile Development commands)
- **Environment**: Ensure all required env vars are set in deployment environment
- **Database**: Run `pnpm prisma migrate deploy` before starting production server
- **Redis**: Required for Socket.IO; use managed Redis in production (e.g., Upstash, Redis Cloud)

## Testing

No test framework is currently configured. If adding tests, consider:
- Vitest or Jest for unit tests
- Playwright or Cypress for e2e tests
- Test tenant isolation thoroughly (critical for multi-tenant architecture)

## Troubleshooting

### "Prisma Client not generated"
```powershell
pnpm prisma generate
```

### Database connection errors
1. Verify PostgreSQL is running: `docker ps`
2. Check `DATABASE_URL` in `.env`
3. Try: `pnpm prisma migrate reset` (WARNING: destroys data)

### Socket.IO not connecting
1. Verify Redis is running: `docker ps`
2. Check `REDIS_URL` in `.env`
3. Ensure Socket.IO server initialized (check server logs)

### Tenant not resolving
1. Check middleware is running (should set `x-tenant-subdomain` header)
2. Verify tenant exists in database: `pnpm prisma studio`
3. Check hostname matches Domain or Tenant slug

### Next.js build errors
1. Run `pnpm prisma generate` first
2. Check TypeScript errors: `pnpm lint`
3. Clear Next.js cache: `rm -rf .next`
