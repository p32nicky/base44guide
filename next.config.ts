import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "base44site.vercel.app" }],
        destination: "https://www.base44guide.io/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "base44guide.io" }],
        destination: "https://www.base44guide.io/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
