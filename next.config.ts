import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  webpack: (config, { dev, isServer }) => {
    // Optimize chunk loading and prevent timeout issues
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 30,
        maxAsyncRequests: 30,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      }
    }
    
    // Add timeout configuration for chunk loading
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        maxSize: 244000,
      },
    }
    
    return config
  },
  images: {
    // Cloudinary handles all resizing/format optimization (f_auto, q_auto) on
    // its own free CDN via src/lib/cloudinary-loader.ts, so the built-in
    // Vercel image optimizer (/_next/image) is never invoked and remote
    // domain allowlisting is no longer needed.
    loader: 'custom',
    loaderFile: './src/lib/cloudinary-loader.ts',
  },
  serverExternalPackages: ['firebase-admin']
}

export default nextConfig
