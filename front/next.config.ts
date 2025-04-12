/**
 * Next.jsの設定ファイル
 *
 * このファイルでは以下の設定を管理します：
 * - パッケージインポートの最適化（バンドルサイズの削減）
 *
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js
 */
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    // ビルド時の型チェックを有効化
    ignoreBuildErrors: false,
  },
  // パスエイリアスの設定
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
    };
    return config;
  },
};

export default nextConfig;
