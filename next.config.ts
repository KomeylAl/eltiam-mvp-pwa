import type { NextConfig } from "next";
import path from "path";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  customWorkerDir: "worker",
  fallbacks: {
    document: "/home/offline",
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // Disable Next in-memory IncrementalCache — known to grow unbound in
  // long-lived standalone Docker processes (unique URLs / fetch retention).
  cacheMaxMemorySize: 0,
  turbopack: {
    root: path.join(__dirname),
    resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withPWA(nextConfig);
