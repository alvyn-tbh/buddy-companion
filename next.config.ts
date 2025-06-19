import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['openai', 'bull', 'redis'],
  
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=10, stale-while-revalidate=59',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
