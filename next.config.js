/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'valences3.s3.ap-south-1.amazonaws.com',
      },
    ],
  },
};

module.exports = nextConfig;
