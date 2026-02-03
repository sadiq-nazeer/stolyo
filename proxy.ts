import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const stripPort = (host: string) => host.split(":")[0]?.toLowerCase();

const DASHBOARD_HOST = (process.env.DASHBOARD_HOST ?? "stolyo.com").toLowerCase();
const BASE_DOMAIN = stripPort(DASHBOARD_HOST) ?? "stolyo.com";

/**
 * Marketing host defaults to the apex domain if it looks like a real domain.
 * In local dev, BASE_DOMAIN might be "localhost" — in that case we treat it as tenant-capable.
 */
const MARKETING_HOST =
  stripPort(process.env.MARKETING_HOST ?? "") ||
  (BASE_DOMAIN.includes(".") ? BASE_DOMAIN : "");

const isTenantHost = (hostname: string) => {
  if (!hostname) return false;
  if (MARKETING_HOST && hostname === MARKETING_HOST) return false;
  if (hostname === BASE_DOMAIN) return false;
  return true;
};

const extractSubdomain = (hostname: string) => {
  if (!hostname || !BASE_DOMAIN) return null;
  if (!hostname.endsWith(`.${BASE_DOMAIN}`)) return null;
  const remainder = hostname.slice(0, -(`.${BASE_DOMAIN}`.length));
  if (!remainder) return null;
  return remainder.split(".")[0] ?? null;
};

export default function proxy(req: NextRequest) {
  const host =
    req.headers.get("x-forwarded-host") ??
    req.headers.get("host") ??
    "";
  const hostname = stripPort(host) ?? "";
  const subdomain = extractSubdomain(hostname);

  const shouldRewriteToStorefront =
    isTenantHost(hostname) && req.nextUrl.pathname === "/";

  const response = shouldRewriteToStorefront
    ? NextResponse.rewrite(new URL("/storefront", req.url))
    : NextResponse.next();

  if (hostname) response.headers.set("x-tenant-hostname", hostname);
  if (subdomain) response.headers.set("x-tenant-subdomain", subdomain);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
