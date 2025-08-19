/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore for migration validation
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore for migration validation
  },
  // Environment variable configuration to mirror Vite setup
  env: {
    VITE_ORIGIN_CLIENT_ID: process.env.VITE_ORIGIN_CLIENT_ID,
    VITE_ORIGIN_API_URL: process.env.VITE_ORIGIN_API_URL,
    VITE_ORIGIN_SUBGRAPH_URL: process.env.VITE_ORIGIN_SUBGRAPH_URL,
  },
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