import { prisma } from "@/lib/db/client";
import { env } from "@/lib/env";
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

  const { DASHBOARD_HOST, MARKETING_HOST } = env();
  const baseDomain = stripPort(DASHBOARD_HOST);
  const marketingHost =
    stripPort(MARKETING_HOST ?? "") || (baseDomain.includes(".") ? baseDomain : "");

  // Never treat the marketing host / apex host as a tenant via fallback parsing.
  if ((marketingHost && hostname === marketingHost) || hostname === baseDomain) {
    return null;
  }

  // Only infer slug for known subdomain shapes like `${slug}.${baseDomain}`.
  if (!baseDomain || !hostname.endsWith(`.${baseDomain}`)) {
    return null;
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
