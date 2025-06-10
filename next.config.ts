import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-button',
      '@radix-ui/react-card',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-icons',
      '@radix-ui/react-input',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      'lucide-react',
      'framer-motion',
      "@reown/appkit",
      "@reown/appkit-adapter-ethers",
      "@tanstack/react-query-devtools",
      "@tiptap/extension-highlight",
      "@tiptap/extension-image",
      "@tiptap/extension-link",
      "@tiptap/extension-subscript",
      "@tiptap/extension-superscript",
      "@tiptap/extension-task-item",
      "@tiptap/extension-task-list",
      "@tiptap/extension-text-align",
      "@tiptap/extension-typography",
      "@tiptap/extension-underline"
    ],
  },
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value:
              "https://stage.sasasasa.co, http://localhost, https://sasasasa.co, https://ra.sasasasa.co", // Set your origin
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, PATCH, OPTIONS",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        hostname: "stage.sasasasa.co",
      },
      {
        hostname: "localhost",
      },
      {
        hostname: "sasasasa.co",
      },
      {
        hostname: "ra.sasasasa.co",
      },
      {
        hostname: "beta.sasasasa.co",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96],
    domains: [
      // ... existing domains ...
      "stage.sasasasa.co", // Add this line
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

module.exports = withBundleAnalyzer(nextConfig);
