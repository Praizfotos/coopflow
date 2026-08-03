/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
    NEXT_PUBLIC_STELLAR_HORIZON: process.env.NEXT_PUBLIC_STELLAR_HORIZON || "https://horizon-testnet.stellar.org",
    NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK || "Test SDF Network ; September 2015",
  },
};

module.exports = nextConfig;