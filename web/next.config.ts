import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/uz',
        permanent: false,
      },
      {
        source: '/jp',
        destination: '/ja',
        permanent: false,
      },
      {
        source: '/jp/:path*',
        destination: '/ja/:path*',
        permanent: false,
      },
      {
        source: '/dashboard/:path*',
        destination: '/uz/dashboard/:path*',
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: '/uz/admin/:path*',
        permanent: false,
      },
      {
        source: '/auth/:path*',
        destination: '/uz/auth/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
