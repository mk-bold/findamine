/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000',
  },
  // Ensure Next.js uses the correct port for static assets
  assetPrefix: process.env.NODE_ENV === 'development' ? undefined : undefined,
  // Force Next.js to use the current port
  experimental: {
    forceSwcTransforms: true,
  },
}

module.exports = nextConfig 