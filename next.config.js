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

  async redirects() {
    return [
      {
        source: '/',
        destination: '/sign_in',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
