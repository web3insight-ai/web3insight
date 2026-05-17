import path from 'node:path';
import type { NextConfig } from 'next';

export interface CreateNextConfigOptions {
  /** Workspace packages to transpile (default: all @web3insight/*). */
  transpilePackages?: string[];
  /** Extra packages whose imports should be tree-shaken into direct imports. */
  optimizePackageImports?: string[];
  /** Extra packages to keep external in server bundles. */
  serverExternalPackages?: string[];
  /** Image remotePatterns to add on top of defaults. */
  extraImageHosts?: Array<{ protocol: 'http' | 'https'; hostname: string }>;
  /** Arbitrary NextConfig overrides applied last. */
  overrides?: NextConfig;
}

const DEFAULT_TRANSPILE = ['@web3insight/types', '@web3insight/ui', '@web3insight/api-contract', '@web3insight/api-client', '@web3insight/query-keys', '@web3insight/env-base', '@web3insight/auth-privy'];
const DEFAULT_OPTIMIZE = ['lucide-react', 'recharts', 'framer-motion', 'date-fns'];
const DEFAULT_IMAGE_HOSTS = [
  { protocol: 'https' as const, hostname: 'avatars.githubusercontent.com' },
  { protocol: 'https' as const, hostname: 'github.com' },
];

/**
 * Build a NextConfig with monorepo-aware defaults.
 *
 * - `output: 'standalone'` for Docker/Vercel server builds
 * - `outputFileTracingRoot` set to monorepo root so workspace package files get bundled
 * - Shared transpilePackages / optimizePackageImports baked in
 */
export function createNextConfig(options: CreateNextConfigOptions = {}): NextConfig {
  const {
    transpilePackages = [],
    optimizePackageImports = [],
    serverExternalPackages = [],
    extraImageHosts = [],
    overrides = {},
  } = options;

  const config: NextConfig = {
    output: 'standalone',
    outputFileTracingRoot: path.join(process.cwd(), '../..'),
    reactStrictMode: true,
    transpilePackages: [...new Set([...DEFAULT_TRANSPILE, ...transpilePackages])],
    experimental: {
      optimizePackageImports: [...new Set([...DEFAULT_OPTIMIZE, ...optimizePackageImports])],
    },
    serverExternalPackages: [
      'pino',
      'pino-pretty',
      'thread-stream',
      'sonic-boom',
      'encoding',
      ...serverExternalPackages,
    ],
    images: {
      remotePatterns: [...DEFAULT_IMAGE_HOSTS, ...extraImageHosts],
      formats: ['image/webp', 'image/avif'],
    },
    turbopack: {},
    ...overrides,
  };

  return config;
}
