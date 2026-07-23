/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ["isomorphic-dompurify"],
  },
};

export default nextConfig;
