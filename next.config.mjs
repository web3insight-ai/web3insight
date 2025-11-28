import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add empty turbopack config to satisfy Next.js but we'll use webpack flag
  turbopack: {},
  // Webpack configuration for fallback/build
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    }

    // Exclude test files from being bundled
    config.module = config.module || {}
    config.module.rules = config.module.rules || []
    config.module.rules.push({
      test: /\.test\.(js|jsx|ts|tsx)$/,
      loader: 'ignore-loader',
    })

    // Ignore Node.js modules and test-related files in client bundles
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
        worker_threads: false,
        child_process: false,
      }
    }

    // Exclude problematic test/bench files from being processed
    config.module.rules.push({
      test: /\/(test|bench|helper)\.(js|ts|cjs|mjs)$/,
      use: 'ignore-loader',
    })

    // Handle viem test client by providing an empty module
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      // Provide empty modules for viem test-related code
      'viem/_esm/clients/createTestClient.js': false,
      'viem/_esm/clients/decorators/test.js': false,
    }

    return config
  },
}

export default nextConfig
