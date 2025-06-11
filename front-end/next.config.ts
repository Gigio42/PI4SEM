import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,  // Proxy API calls to backend to avoid CORS issues
  async rewrites() {
    return [
      // Specific component endpoints
      {
        source: '/api/components',
        destination: 'http://localhost:3000/components',
      },
      {
        source: '/api/components/:path*',
        destination: 'http://localhost:3000/components/:path*',
      },
      {
        source: '/api/v1/components',
        destination: 'http://localhost:3000/components',
      },
      {
        source: '/api/v1/components/:path*',
        destination: 'http://localhost:3000/components/:path*',
      },
      // General API proxy (should be last)
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/:path*',
      },
    ];
  },
  
  // Suppress useLayoutEffect warning during SSR
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (isServer) {
      config.externals = config.externals || [];
      // Suppress useLayoutEffect warning for server-side rendering
      config.resolve.alias = {
        ...config.resolve.alias,
        'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js',
      };
    }
    return config;
  },
};

export default nextConfig;
