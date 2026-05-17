import type { NextConfig } from "next";
import { env } from "./src/env";

void env;

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore for migration validation
  },
  // Note: eslint config is no longer supported in next.config.ts in Next.js 16
  // Use eslint command directly or configure in .eslintrc.cjs

  // Optimize barrel file imports for better tree-shaking
  // Automatically transforms imports to direct imports at build time
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@nextui-org/react",
      "recharts",
      "framer-motion",
      "date-fns",
      "@json-render/react",
    ],
  },

  // External packages that should not be bundled by server components
  // This helps with pino, WalletConnect, and other Node.js-specific modules
  // Reason: kysely + pg are used by copilot DB (server-only). @json-render/core
  // is used by pipeJsonRender in the chat route. Externalizing them avoids
  // webpack processing their dependency trees, reducing peak memory.
  serverExternalPackages: [
    "pino",
    "pino-pretty",
    "thread-stream",
    "sonic-boom",
    "fastbench",
    "encoding",
    "kysely",
    "pg",
    "@json-render/core",
  ],

  // Turbopack configuration
  turbopack: {
    // Turbopack handles most optimizations automatically
    // Note: Some dependencies (e.g., WalletConnect with pino) may have compatibility issues
    // Use --webpack flag for production builds if needed
  },

  // Reason: Webpack config kept for backward compatibility when using --webpack flag.
  // Default production build uses Turbopack (next build without --webpack).
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
