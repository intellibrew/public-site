import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['sjc.microlink.io', 'github.com', 'i.ibb.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;