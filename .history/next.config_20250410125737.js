/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configure async/await and other features
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig 