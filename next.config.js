/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Tree-shakes icon/component libraries — reduces dev bundle significantly
    optimizePackageImports: [
      'react-icons',
      'react-bootstrap',
      'lodash-es',
      '@carbon/icons-react',
    ],
  },

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
    // Reduced set — lowers memory usage in dev on 8GB RAM
    deviceSizes: [640, 1080, 1920],
    imageSizes: [16, 32, 64, 128],
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
