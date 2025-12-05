import type { NextConfig } from "next";
import { env } from "./src/env";

void env;

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore for migration validation
  },
  // Note: eslint config is no longer supported in next.config.ts in Next.js 16
  // Use eslint command directly or configure in .eslintrc.cjs

  // External packages that should not be bundled by server components
  // This helps with pino, WalletConnect, and other Node.js-specific modules
  serverExternalPackages: [
    'pino',
    'pino-pretty',
    'thread-stream',
    'sonic-boom',
    'fastbench',
    'encoding',
  ],

  // Turbopack configuration
  turbopack: {
    // Turbopack handles most optimizations automatically
    // Note: Some dependencies (e.g., WalletConnect with pino) may have compatibility issues
    // Use --webpack flag for production builds if needed
  },

  // Keep webpack config for backward compatibility when using --webpack flag
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

  // Images domain configuration
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
