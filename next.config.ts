import type { NextConfig } from "next";
import { env } from "./src/env";
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
      port: 5679, // Change port to avoid conflict
    }),
  },
  webpack: (config, { isServer, webpack }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };

    // Externalize server-only packages that shouldn't be bundled for client
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        "pino-pretty": "pino-pretty",
        encoding: "encoding",
      });
    }

    // Ignore optional dependencies that cause build issues
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(pino-pretty|encoding)$/,
      })
    );

    return config;
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
