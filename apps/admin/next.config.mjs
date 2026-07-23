/** @type {import('next').NextConfig} */
const nextConfig = {
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
