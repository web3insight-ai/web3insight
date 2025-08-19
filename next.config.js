/* eslint-env node */
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore for migration validation
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore for migration validation
  },
  // Environment variable configuration to mirror Vite setup
  // Remove custom env configuration - let Next.js handle NEXT_PUBLIC_ automatically
  // Server-side variables will be accessed directly via process.env in server code
  // Ensure proper bundling for server-side dependencies
  serverExternalPackages: ['@remix-run/node'],
  // Handle problematic dependencies
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
        'pino-pretty': 'pino-pretty',
        'encoding': 'encoding',
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
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
    ],
  },
  // Redirects configuration
  async redirects() {
    return [
      // Add any necessary redirects
    ];
  },
};

module.exports = nextConfig;

