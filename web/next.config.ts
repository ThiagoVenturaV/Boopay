import type { NextConfig } from 'next';

const backendOrigin = process.env.BOOPAY_API_URL || 'http://127.0.0.1:3333';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/api/:path*`,
      },
      {
        source: '/health',
        destination: `${backendOrigin}/health`,
      },
    ];
  },
};

export default nextConfig;
