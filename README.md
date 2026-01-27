# Stolyo - Multi-Vendor E-Commerce Platform

A comprehensive multi-tenant e-commerce platform built with Next.js, Prisma, and PostgreSQL.

## 🚀 Quick Start Guide

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **pnpm** - Package manager (install via `npm install -g pnpm`)
- **Docker & Docker Compose** (optional, for local development) - [Download](https://www.docker.com/)
- **PostgreSQL** (if not using Docker) - [Download](https://www.postgresql.org/download/)
- **Redis** (if not using Docker) - [Download](https://redis.io/download/)

### Step 1: Install Dependencies

```powershell
pnpm install
```

### Step 2: Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://stolyo:stolyo@localhost:5432/stolyo"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# Email Server Configuration
EMAIL_SERVER_HOST="localhost"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email-user"
EMAIL_SERVER_PASSWORD="your-email-password"
EMAIL_FROM="noreply@stolyo.local"

# Application Configuration
DASHBOARD_HOST="localhost:3000"

# Redis Configuration
REDIS_URL="redis://localhost:6379"
```

**Important:** Generate a secure `NEXTAUTH_SECRET` using:
```powershell
# PowerShell command to generate a secure secret
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Step 3: Set Up Database

#### Option A: Using Docker Compose (Recommended for Development)

Start all services (PostgreSQL, Redis) with Docker:

```powershell
docker-compose up -d
```

This will start:
- PostgreSQL on port `5432`
- Redis on port `6379`

#### Option B: Manual Setup

If you prefer to set up PostgreSQL and Redis manually:

1. **PostgreSQL**: Create a database named `stolyo`
2. **Redis**: Start your Redis server

### Step 4: Run Database Migrations

Generate Prisma Client and run migrations:

```powershell
# Generate Prisma Client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev
```

### Step 5: Start Development Server

```powershell
pnpm dev
```

The application will be available at `http://localhost:3000`

## 📋 Available Scripts

- `pnpm dev` - Start Next.js development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm prisma generate` - Generate Prisma Client
- `pnpm prisma migrate dev` - Run database migrations
- `pnpm prisma studio` - Open Prisma Studio (database GUI)

## 🏗️ Project Structure

```
stolyo/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── storefront/        # Storefront pages
│   └── vendor/            # Vendor dashboard pages
├── components/             # React components
├── lib/                    # Utility libraries
│   ├── db/                # Database clients
│   ├── realtime/          # Real-time features
│   └── tenant/            # Multi-tenant logic
├── prisma/                 # Prisma schema and migrations
│   └── schema.prisma      # Database schema
├── public/                 # Static assets
└── types/                  # TypeScript type definitions
```

## 🔧 Configuration

### Database Schema

The project uses Prisma for database management. The schema is located at `prisma/schema.prisma`.

Key models:
- **Tenant** - Multi-tenant organization
- **User** - User accounts
- **Domain** - Custom domains for tenants
- **UserTenant** - User-tenant relationships with roles

### Multi-Tenant Architecture

This platform supports multiple tenants (organizations) with:
- Separate database schemas per tenant
- Custom domain support
- Role-based access control (OWNER, ADMIN, MEMBER)

## 🐳 Docker Development

The project includes a `docker-compose.yml` file for easy local development:

```powershell
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

## 🔐 Authentication

The project uses NextAuth v5 (beta) for authentication. Configuration files:
- `auth.ts` - NextAuth configuration
- `auth.config.ts` - Auth configuration
- `app/api/auth/[...nextauth]/route.ts` - Auth API route

## 📧 Email Configuration

Email functionality requires SMTP server configuration. For development, you can use:
- **Mailtrap** (testing) - [mailtrap.io](https://mailtrap.io)
- **SendGrid** (production)
- **AWS SES** (production)

Update the email environment variables accordingly.

## 🚨 Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Verify PostgreSQL is running:
   ```powershell
   # Check if PostgreSQL is running
   docker ps
   ```

2. Verify DATABASE_URL is correct in `.env`

3. Try resetting the database:
   ```powershell
   pnpm prisma migrate reset
   ```

### Port Already in Use

If port 3000 is already in use:

1. Change the port in `package.json` scripts:
   ```json
   "dev": "next dev -p 3001"
   ```

2. Or stop the process using port 3000

### Prisma Client Not Generated

If you see Prisma Client errors:

```powershell
pnpm prisma generate
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth Documentation](https://next-auth.js.org/)
- [Docker Documentation](https://docs.docker.com/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

[Add your license here]

---

**Need Help?** Check the `PROJECT_DOCUMENTATION.md` file for detailed architecture and feature documentation.

