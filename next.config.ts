import type { NextConfig } from "next";

// Trigger deploy
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: false,
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

export default withPWA(nextConfig);
