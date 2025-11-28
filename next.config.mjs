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
  webpack: (config, { isServer, webpack }) => {
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

    // Exclude problematic test/bench files from being processed
    config.module.rules.push({
      test: /\/(test|bench|helper)\.(js|ts|cjs|mjs)$/,
      use: 'ignore-loader',
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

    // Replace viem test modules with empty exports
    config.plugins = config.plugins || []
    
    // Use IgnorePlugin to prevent bundling test-related modules
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/createTestClient\.js$/,
        contextRegExp: /viem\/_esm\/clients$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/clients\/createTestClient\.js$/,
        contextRegExp: /viem\/_esm$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/test\.js$/,
        contextRegExp: /viem\/_esm\/clients\/decorators$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/clients\/decorators\/test\.js$/,
        contextRegExp: /viem\/_esm$/,
      })
    )
    
    // Also use NormalModuleReplacementPlugin as backup
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /viem\/_esm\/clients\/createTestClient/,
        path.resolve(__dirname, 'lib/empty-module.js')
      ),
      new webpack.NormalModuleReplacementPlugin(
        /viem\/_esm\/clients\/decorators\/test/,
        path.resolve(__dirname, 'lib/empty-module.js')
      )
    )

    return config
  },
}

export default nextConfig
