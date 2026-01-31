import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const DASHBOARD_HOST =
  process.env.DASHBOARD_HOST?.toLowerCase() ?? "stolyo.com";

const stripPort = (host: string) => host.split(":")[0]?.toLowerCase();

const extractSubdomain = (host: string) => {
  const hostname = stripPort(host);
  if (!hostname || hostname === DASHBOARD_HOST) return null;
  const parts = hostname.split(".");
  if (parts.length < 3) return null;
  return parts[0];
};

export default function proxy(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const subdomain = extractSubdomain(host);
  const hostname = stripPort(host);

  const response = NextResponse.next();
  if (hostname) {
    response.headers.set("x-tenant-hostname", hostname);
  }
  if (subdomain) {
    response.headers.set("x-tenant-subdomain", subdomain);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
