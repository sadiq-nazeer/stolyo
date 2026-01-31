import { prisma } from "@/lib/db/client";
import { env } from "@/lib/env";
import { resolveTenantByHost } from "@/lib/tenant/tenant-resolver";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import { headers } from "next/headers";

const getRequestHost = async () => {
  const hdrs = await headers();
  return (
    hdrs.get("x-forwarded-host") ??
    hdrs.get("x-tenant-hostname") ??
    hdrs.get("host") ??
    ""
  );
};

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  providers: [
    Credentials({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const emailInput = credentials?.email;
        const passwordInput = credentials?.password;
        if (typeof emailInput !== "string" || typeof passwordInput !== "string") {
          return null;
        }

        const email = emailInput.toLowerCase();
        const password = passwordInput;

        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user?.hashedPassword) return null;

        const isValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isValid) return null;

        const host = await getRequestHost();
        if (host) {
          const tenant = await resolveTenantByHost(host);
          if (tenant) {
            const membership = await prisma.userTenant.findUnique({
              where: {
                userId_tenantId: {
                  userId: user.id,
                  tenantId: tenant.id,
                },
              },
            });
            if (!membership) return null;
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token }) => {
      if (!token.sub) return token;

      const host = await getRequestHost();
      if (!host) return token;

      const tenant = await resolveTenantByHost(host);
      if (!tenant) {
        token.tenantId = null;
        token.tenantRole = null;
        return token;
      }

      const membership = await prisma.userTenant.findUnique({
        where: {
          userId_tenantId: {
            userId: token.sub,
            tenantId: tenant.id,
          },
        },
      });

      token.tenantId = membership?.tenantId ?? null;
      token.tenantRole = membership?.role ?? null;
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.sub) {
        const tenantId =
          typeof token.tenantId === "string" ? token.tenantId : undefined;
        const tenantRole =
          token.tenantRole === "OWNER" ||
          token.tenantRole === "ADMIN" ||
          token.tenantRole === "MEMBER"
            ? token.tenantRole
            : undefined;
        session.user.id = token.sub;
        session.user.tenantId = tenantId;
        session.user.tenantRole = tenantRole;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
