import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployments
  output: "standalone",
  experimental: {
    // Enable experimental features if needed
  },
  // Redirect import paths to src directory
  rewrites: async () => {
    return [];
  },
};

export default nextConfig;
