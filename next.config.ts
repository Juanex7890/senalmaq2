import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'storage.googleapis.com',
      'lh3.googleusercontent.com',
      'yt3.ggpht.com',
      'i.ytimg.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'picsum.photos',
      'cdn.pixabay.com',
      'images.pexels.com',
      'i.postimg.cc'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      // TODO: add project-specific CDN domains, e.g. { protocol: 'https', hostname: 'cdn.senalmaq.com' }
    ],
  },
  serverExternalPackages: ['firebase-admin']
}

export default nextConfig
