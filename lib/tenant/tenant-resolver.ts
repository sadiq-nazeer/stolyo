import { prisma } from "@/lib/db/client";
import type { Tenant } from "@prisma/client";

const stripPort = (host: string) => host.split(":")[0]?.toLowerCase();

export const resolveTenantByHost = async (
  host: string,
): Promise<Tenant | null> => {
  const hostname = stripPort(host);
  if (!hostname) return null;

  const domainMatch = await prisma.domain.findUnique({
    where: { hostname },
    include: { tenant: true },
  });
  if (domainMatch?.tenant) {
    return domainMatch.tenant;
  }

  const slug = hostname.split(".")[0];
  const tenant = await prisma.tenant.findFirst({
    where: {
      OR: [
        { slug },
        { schemaName: slug },
      ],
    },
  });

  return tenant;
};
