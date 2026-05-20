import type { NextConfig } from "next";

// Trigger deploy
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: false,
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
