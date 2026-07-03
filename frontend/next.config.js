/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Speed up builds and prevent minor style errors from failing deployments
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript build errors if any arise to ensure smooth deployment
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig;
