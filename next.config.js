const nextPWA = require("@ducanh2912/next-pwa");

const runtimeCaching = nextPWA.runtimeCaching.map((entry) => {
  const cacheName = entry?.options?.cacheName;

  if (
    cacheName === "next-static-js-assets" ||
    cacheName === "static-js-assets"
  ) {
    return {
      ...entry,
      handler: "NetworkFirst",
      options: {
        ...entry.options,
        cacheName,
        networkTimeoutSeconds: 3,
      },
    };
  }

  return entry;
});

const withPWA = nextPWA.default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  workboxOptions: {
    clientsClaim: true,
    skipWaiting: true,
    runtimeCaching,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  webpack: (config) => config,
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
    ];
  },
  turbopack: {
    root: __dirname,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

module.exports = withPWA(nextConfig);
