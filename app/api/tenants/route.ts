import { prisma } from "@/lib/db/client";
import { ensureTenantSchema } from "@/lib/db/tenant-migrator";
import { env } from "@/lib/env";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

type TenantPayload = {
  name: string;
  slug: string;
  ownerEmail: string;
  ownerPassword: string;
  ownerName?: string;
  customDomain?: string;
};

export const POST = async (request: Request) => {
  const adminKey = env().ADMIN_API_KEY;
  if (adminKey) {
    const providedKey = request.headers.get("x-admin-api-key");
    if (providedKey !== adminKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const body = (await request.json()) as TenantPayload;
  const name = body.name?.trim();
  const slug = body.slug?.trim().toLowerCase();
  const ownerEmail = body.ownerEmail?.trim().toLowerCase();
  const ownerPassword = body.ownerPassword?.trim();
  const ownerName = body.ownerName?.trim();
  const customDomain = body.customDomain?.trim().toLowerCase();

  if (!name || !slug || !ownerEmail || !ownerPassword) {
    return NextResponse.json(
      { error: "name, slug, ownerEmail, and ownerPassword are required" },
      { status: 400 },
    );
  }

  const schemaName = `t_${slug.replace(/[^a-z0-9_]/g, "_")}`;
  await ensureTenantSchema(schemaName);

  const existingUser = await prisma.user.findUnique({
    where: { email: ownerEmail },
  });
  if (existingUser) {
    return NextResponse.json(
      { error: "Owner email already exists" },
      { status: 409 },
    );
  }

  const hashedPassword = await bcrypt.hash(ownerPassword, 10);

  const tenant = await prisma.tenant.create({
    data: {
      name,
      slug,
      schemaName,
      domains: {
        create: [
          {
            hostname: `${slug}.${env().DASHBOARD_HOST ?? "stolyo.com"}`,
            isPrimary: !customDomain,
          },
          ...(customDomain
            ? [
                {
                  hostname: customDomain,
                  isPrimary: true,
                },
              ]
            : []),
        ],
      },
      users: {
        create: {
          role: "OWNER",
          user: {
            create: {
              email: ownerEmail,
              hashedPassword,
              name: ownerName || undefined,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(tenant, { status: 201 });
};
