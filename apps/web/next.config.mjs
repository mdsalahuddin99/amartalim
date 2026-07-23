/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ["isomorphic-dompurify"],
  },
};

export default nextConfig;
