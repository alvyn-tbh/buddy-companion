import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server external packages for better performance
  serverExternalPackages: ['openai', 'bull', 'redis'],
  
  // Optimize package imports for better tree-shaking
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-avatar',
      '@radix-ui/react-label',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
    ],
    // Enable server components and other experimental features
    serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
    // Improve build performance
    optimizeCss: true,
    // Enable partial prerendering for better performance
    ppr: true,
  },

  // Enable PWA and service worker support
  // This prepares for offline functionality
  swcMinify: true,
  
  // Compression for better performance
  compress: true,

  // Image optimization configuration with CDN preparation
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Prepare for external CDN integration
    // domains: ['cdn.example.com'], // Uncomment when CDN is ready
    // loader: 'custom', // For custom CDN implementation
    // loaderFile: './lib/image-loader.ts', // Custom image loader
  },

  // Performance headers and caching
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=10, stale-while-revalidate=59',
          },
          {
            key: 'X-Edge-Cache',
            value: 'MISS',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Service Worker headers
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      // Manifest headers for PWA
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },

  // Route preloading configuration
  async rewrites() {
    return [
      // Prepare for edge function rewrites
      {
        source: '/api/edge/:path*',
        destination: '/api/:path*',
      },
    ];
  },

  // Webpack optimizations with future enhancements
  webpack: (config, { dev, isServer, webpack }) => {
    // Production optimizations
    if (!dev) {
      // Enhanced code splitting
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
            common: {
              name: 'common',
              minChunks: 2,
              priority: -30,
              reuseExistingChunk: true,
            },
            // React and framework chunks
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react',
              chunks: 'all',
              priority: 20,
            },
            // UI library chunks
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
              name: 'ui',
              chunks: 'all',
              priority: 15,
            },
            // Animation library chunks
            animations: {
              test: /[\\/]node_modules[\\/](framer-motion|motion)[\\/]/,
              name: 'animations',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      };

      // Service Worker support
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.SW_ENABLED': JSON.stringify(true),
        })
      );
    }

    // Enable WebAssembly support for future optimizations
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  },

  // Output configuration for static export capability
  output: 'standalone',
  
  // Enable static optimization
  trailingSlash: false,
  
  // TypeScript configuration
  typescript: {
    // Enable strict mode for better performance
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

// Bundle analyzer setup (conditionally applied)
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
