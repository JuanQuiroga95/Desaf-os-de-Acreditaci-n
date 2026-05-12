import type { NextConfig } from "next";

// Trigger deploy
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  trailingSlash: false,
};

export default nextConfig;
