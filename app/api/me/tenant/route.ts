import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { NextResponse } from "next/server";

type TenantLookupResponse =
  | { ok: true; host: string; redirectUrl: string }
  | { ok: false; error: "unauthorized" | "no_tenant" };

const stripPort = (host: string) => host.split(":")[0]?.toLowerCase();

const extractPort = (host: string) => {
  const parts = host.split(":");
  if (parts.length < 2) return null;
  const last = parts[parts.length - 1];
  if (!last) return null;
  return /^\d+$/.test(last) ? last : null;
};

const protocolFromHeaders = (headers: Headers) => {
  const forwardedProto = headers.get("x-forwarded-proto");
  if (forwardedProto === "https" || forwardedProto === "http") return forwardedProto;
  return process.env.NODE_ENV === "production" ? "https" : "http";
};

export const GET = async (request: Request) => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    const payload: TenantLookupResponse = { ok: false, error: "unauthorized" };
    return NextResponse.json(payload, { status: 401 });
  }

  const url = new URL(request.url);
  const targetPath = url.searchParams.get("path") ?? "/store";
  const normalizedPath = targetPath.startsWith("/") ? targetPath : "/store";

  const requestHost =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "";
  const requestHostname = stripPort(requestHost) ?? "";
  const requestPort = extractPort(requestHost);

  const membership = await prisma.userTenant.findFirst({
    where: { userId },
    include: {
      tenant: {
        include: {
          domains: {
            orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
          },
        },
      },
    },
  });

  const domains = membership?.tenant?.domains ?? [];
  if (domains.length === 0) {
    const payload: TenantLookupResponse = { ok: false, error: "no_tenant" };
    return NextResponse.json(payload, { status: 404 });
  }

  // Prefer redirecting to the current host if it is mapped to this tenant (local dev friendly).
  const matchedDomain = requestHostname
    ? domains.find((d) => d.hostname === requestHostname)
    : undefined;
  const primaryDomain = domains.find((d) => d.isPrimary)?.hostname ?? domains[0]!.hostname;
  const chosenHostname = matchedDomain?.hostname ?? primaryDomain;

  const proto = protocolFromHeaders(new Headers(request.headers));
  const hostWithPort =
    requestPort && !chosenHostname.includes(":")
      ? `${chosenHostname}:${requestPort}`
      : chosenHostname;
  const redirectUrl = `${proto}://${hostWithPort}${normalizedPath}`;

  const payload: TenantLookupResponse = {
    ok: true,
    host: chosenHostname,
    redirectUrl,
  };
  return NextResponse.json(payload);
};

