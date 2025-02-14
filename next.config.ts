import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://stage.sasasasa.co, http://localhost, https://sasasasa.co, https://ra.sasasasa.co", // Set your origin
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, PATCH, OPTIONS",
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        hostname: 'stage.sasasasa.co',
      },
      {
        hostname: 'localhost',
      },
      {
        hostname: 'sasasasa.co',
      },
      {
        hostname: 'ra.sasasasa.co',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96],
    domains: [
      // ... existing domains ...
      'stage.sasasasa.co', // Add this line
    ],
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: `${process.env.NEXT_PUBLIC_SASASASA_API_URL}/api/:path*`, // Proxy to Backend
  //     },
  //   ];
  // },
  
};

module.exports = nextConfig;
