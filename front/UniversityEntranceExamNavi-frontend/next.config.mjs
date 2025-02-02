/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  swcMinify: true,
  // 画像最適化の設定
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  // パフォーマンス最適化
  experimental: {
    optimizeCss: true,
    serverActions: true,
    typedRoutes: true,
    webpackBuildWorker: true,
  },
  // セキュリティヘッダー
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
      ],
    },
  ],
  // 環境変数の検証
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
