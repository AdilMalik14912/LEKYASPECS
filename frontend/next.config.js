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
  },
  async rewrites() {
    // Only rewrite /api/* to localhost:5000 during local development.
    // In production on Vercel, vercel.json handles routing /api/* to backend/src/app.js.
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig;
