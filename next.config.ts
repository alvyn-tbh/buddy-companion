import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['openai', 'bull', 'redis'],
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      // Don't bundle Bull Queue and Redis for client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'bull': false,
        'redis': false,
        'fs': false,
        'net': false,
        'tls': false,
      };
    }
    return config;
  },
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
