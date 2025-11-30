import type { NextConfig } from "next";
import { env } from "./src/env";

void env;

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore for migration validation
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore for migration validation
  },
  webpack: (config, { isServer, webpack }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };

    // Externalize Solana dependencies (required by Privy)
    config.externals = config.externals || [];
    config.externals["@solana/kit"] = "commonjs @solana/kit";
    config.externals["@solana-program/memo"] = "commonjs @solana-program/memo";
    config.externals["@solana-program/system"] =
      "commonjs @solana-program/system";
    config.externals["@solana-program/token"] =
      "commonjs @solana-program/token";

    // Externalize server-only packages that shouldn't be bundled for client
    if (!isServer) {
      config.externals.push({
        "pino-pretty": "pino-pretty",
        encoding: "encoding",
      });
    }

    // Note: WalletConnect modules should be bundled for production build

    // Ignore optional dependencies that cause build issues
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(pino-pretty|encoding)$/,
      }),
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
