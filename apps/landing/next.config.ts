import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import "./env";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // For local images in /public folder
    unoptimized: false,
    // Remote patterns for external images
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/api/public/files/**",
      },
      {
        protocol: "http",
        hostname: "**", // Allow any IP for development (backoffice API)
        pathname: "/api/public/files/**",
      },
      {
        protocol: "https",
        hostname: "**", // Allow any hostname for production backoffice API
        pathname: "/api/public/files/**",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
