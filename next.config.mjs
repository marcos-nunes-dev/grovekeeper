/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'render.albiononline.com',
        port: '',
        pathname: '/v1/**',
      },
    ],
  },
};

export default nextConfig;
