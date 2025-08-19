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
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
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

