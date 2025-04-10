/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    domains: ['api.stability.ai']
  },
  env: {
    NEXT_PUBLIC_SOLANA_RPC_URL: process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
    NEXT_PUBLIC_SKIP_PAYMENT: process.env.NEXT_PUBLIC_SKIP_PAYMENT,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self' https://*.solana.com https://*.helius-rpc.com https://*.solana-api.com https://*.solana-mainnet.com https://api.mainnet-beta.solana.com; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ];
  }
}

module.exports = nextConfig 