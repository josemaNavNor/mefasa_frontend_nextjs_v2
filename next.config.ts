import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove dangerous TypeScript and ESLint ignoring for production build safety
  eslint: {
    // Only ignore during development builds, not production
    ignoreDuringBuilds: process.env.NODE_ENV !== 'production',
  },
  typescript: {
    // Only ignore during development builds, not production
    ignoreBuildErrors: process.env.NODE_ENV !== 'production',
  },
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      'react-apexcharts',
    ],
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Bundle analyzer for production optimization
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any) => {
      if (process.env.NODE_ENV === 'production') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(new BundleAnalyzerPlugin());
      }
      return config;
    },
  }),
  
  // API rewrites with better error handling
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
