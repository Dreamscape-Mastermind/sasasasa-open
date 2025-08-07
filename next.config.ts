import type { NextConfig } from "next";

// Conditionally use bundle analyzer only if available
let withBundleAnalyzer: any = (config: any) => config;

try {
  withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
  });
} catch (error) {
  // Bundle analyzer not available, use default config
  console.log("Bundle analyzer not available, skipping...");
}

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: [
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-avatar",
      "@radix-ui/react-button",
      "@radix-ui/react-card",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-icons",
      "@radix-ui/react-input",
      "@radix-ui/react-label",
      "@radix-ui/react-popover",
      "@radix-ui/react-progress",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slider",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "@radix-ui/react-tooltip",
      "lucide-react",
      "framer-motion",
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
      "@tiptap/extension-underline",
    ],
    // Performance optimizations
    optimizeCss: true,
  },
  compress: true,
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value:
              "http://localhost, https://sasasasa.co, https://api.sasasasa.co, https://staging.sasasasa.co, https://staging-api.sasasasa.co",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, PATCH, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Requested-With",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  // Optimize images
  images: {
    remotePatterns: [
      {
        hostname: "localhost",
      },
      {
        hostname: "sasasasa.co",
      },
      {
        hostname: "api.sasasasa.co",
      },
      {
        hostname: "staging.sasasasa.co",
      },
      {
        hostname: "staging-api.sasasasa.co",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
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
