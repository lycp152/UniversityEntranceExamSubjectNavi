/**
 * Next.jsの設定ファイル
 *
 * このファイルでは以下の設定を管理します：
 * - パッケージインポートの最適化（バンドルサイズの削減）
 * - スタンドアロンモードの設定
 * - 出力ディレクトリの設定
 *
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js
 */
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    // ビルド時の型チェックを有効化
    ignoreBuildErrors: false,
  },
  // Turbopackの設定
  turbopack: {
    resolveAlias: {
      '@': './src',
    },
  },
  // スタンドアロンモードの設定
  output: 'standalone',
  // 出力ディレクトリの設定
  distDir: '.next',
  // ビルド時の最適化設定
  swcMinify: true,
  // 画像最適化の設定
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
