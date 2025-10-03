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
      'images.pexels.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  serverExternalPackages: ['firebase-admin']
}

export default nextConfig