import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/db/client";
import { ensureTenantSchema } from "../lib/db/tenant-migrator";

const DEMO_EMAIL = "demo@stolyo.local";
const DEMO_PASSWORD = "demo1234";

const main = async () => {
  const slug = "demo";
  const schemaName = `t_${slug}`;

  await ensureTenantSchema(schemaName);

  const tenant = await prisma.tenant.upsert({
    where: { slug },
    update: {},
    create: {
      name: "Demo Store",
      slug,
      schemaName,
      domains: {
        create: {
          hostname: `${slug}.${process.env.DASHBOARD_HOST ?? "stolyo.local"}`,
          isPrimary: true,
        },
      },
    },
  });

  // So localhost:3000 resolves to the demo tenant (for local dev)
  await prisma.domain.upsert({
    where: { hostname: "localhost" },
    create: {
      hostname: "localhost",
      tenantId: tenant.id,
      isPrimary: false,
    },
    update: { tenantId: tenant.id },
  });

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { hashedPassword },
    create: {
      email: DEMO_EMAIL,
      hashedPassword,
      name: "Demo User",
    },
  });

  await prisma.userTenant.upsert({
    where: {
      userId_tenantId: { userId: user.id, tenantId: tenant.id },
    },
    update: { role: "OWNER" },
    create: {
      userId: user.id,
      tenantId: tenant.id,
      role: "OWNER",
    },
  });

  console.log("Seeded tenant:", tenant.slug);
  console.log("Demo login: email =", DEMO_EMAIL, "| password =", DEMO_PASSWORD);
};

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



