/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/admin',
        permanent: true,
      },
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ["isomorphic-dompurify"],
  },
};

export default nextConfig;
