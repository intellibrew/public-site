/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure default routing at '/'
  basePath: undefined,
  trailingSlash: false,
  experimental: {
    // keep defaults; no weird flags
  },
};
module.exports = nextConfig;
