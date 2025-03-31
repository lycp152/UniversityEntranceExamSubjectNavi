import type { NextConfig } from 'next';

/**
 * Next.jsの設定ファイル
 * ビルド最適化、パッケージインポートの最適化、webpack設定を管理
 *
 * @note experimental: 実験的な機能の設定
 * @note webpack: ビルドプロセスのカスタマイズ
 */
const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      rules: {
        // デフォルトの設定を使用
      },
    },
    optimizePackageImports: ['@heroicons/react', 'lucide-react'],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ignored: ['**/.git/**', '**/node_modules/**', '**/.next/**'],
      };
    }
    return config;
  },
};

export default nextConfig;
