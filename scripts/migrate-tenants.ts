import "dotenv/config";
import { prisma } from "../lib/db/client";
import { migrateAllTenantSchemas } from "../lib/db/tenant-migrator";

const main = async () => {
  const result = await migrateAllTenantSchemas();
  console.log(`Migrated ${result.migrated} tenant schema(s).`);
};

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

