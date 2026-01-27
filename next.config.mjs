/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Turbopack is enabled by default in Next.js 16
  turbopack: {},
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;
