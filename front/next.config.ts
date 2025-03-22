import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      rules: {
        // デフォルトの設定を使用
      },
    },
    optimizePackageImports: ["@heroicons/react", "lucide-react"],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ignored: ["**/.git/**", "**/node_modules/**", "**/.next/**"],
      };
    }
    return config;
  },
};

export default nextConfig;
