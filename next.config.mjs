import withPWA from 'next-pwa'

/** @type {import('next').NextConfig} */
const baseConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['res.cloudinary.com', 'via.placeholder.com'],
    unoptimized: true,
  },
}

const nextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
})(baseConfig)

export default nextConfig
