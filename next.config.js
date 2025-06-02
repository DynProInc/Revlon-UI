/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  basePath: '/revlon-ui',
  assetPrefix: '/revlon-ui/',
  
  // Disable TypeScript checking during build
  typescript: {
    // !! WARN !!
    // Ignoring TypeScript errors for deployment
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint during build
  eslint: {
    // !! WARN !!
    // Ignoring ESLint errors for deployment
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
