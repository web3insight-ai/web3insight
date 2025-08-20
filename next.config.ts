import type { NextConfig } from "next";
import { env } from "./lib/env";
import { codeInspectorPlugin } from "code-inspector-plugin";

void env;

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore for migration validation
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore for migration validation
  },
  turbopack: {
    rules: codeInspectorPlugin({
      bundler: "turbopack",
      hotKeys: ["altKey"],
    }),
  },
  // Images domain configuration if needed
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
    ],
  },
};

export default nextConfig;
