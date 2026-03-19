import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Never bypass TypeScript errors during build.
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  eslint: {
    // Never bypass ESLint during build.
    ignoreDuringBuilds: false,
  },
  // Set the root directory for Turbopack in monorepo
  turbopack: {
    root: __dirname,
  },
  // Optimize for production
  poweredByHeader: false,
  reactStrictMode: true,
  // Improve security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
