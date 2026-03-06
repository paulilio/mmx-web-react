/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Enable type checking in production builds
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  images: {
    unoptimized: true,
  },
  eslint: {
    // Enable ESLint in production builds
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
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
