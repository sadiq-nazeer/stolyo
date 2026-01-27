import { prisma } from "../lib/db/client";
import { ensureTenantSchema } from "../lib/db/tenant-migrator";

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

  console.log("Seeded tenant:", tenant.slug);
};

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



