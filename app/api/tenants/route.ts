import { prisma } from "@/lib/db/client";
import { ensureTenantSchema } from "@/lib/db/tenant-migrator";
import { env } from "@/lib/env";
import { NextResponse } from "next/server";

type TenantPayload = {
  name: string;
  slug: string;
};

export const POST = async (request: Request) => {
  const body = (await request.json()) as TenantPayload;
  const name = body.name?.trim();
  const slug = body.slug?.trim().toLowerCase();

  if (!name || !slug) {
    return NextResponse.json(
      { error: "name and slug are required" },
      { status: 400 },
    );
  }

  const schemaName = `t_${slug.replace(/[^a-z0-9_]/g, "_")}`;
  await ensureTenantSchema(schemaName);

  const tenant = await prisma.tenant.create({
    data: {
      name,
      slug,
      schemaName,
      domains: {
        create: {
          hostname: `${slug}.${env().DASHBOARD_HOST ?? "stolyo.com"}`,
          isPrimary: true,
        },
      },
    },
  });

  return NextResponse.json(tenant, { status: 201 });
};
