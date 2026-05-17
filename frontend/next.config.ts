import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'date-fns', 'framer-motion'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
