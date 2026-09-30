import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/hospital',
        destination: '/hospitals',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
