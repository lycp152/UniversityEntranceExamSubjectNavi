import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc/dist/eslintrc.cjs';

/**
 * Next.jsの設定ファイル
 * ビルド最適化、パッケージインポートの最適化、webpack設定を管理
 *
 * @note experimental: 実験的な機能の設定
 * @note webpack: ビルドプロセスのカスタマイズ
 */

// ESMでの__dirnameの代替実装
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 従来の設定形式との互換性を提供
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// ESLintの設定を定義
const eslintConfig = [
  // Next.jsのコアウェブバイタルとTypeScriptの推奨設定を適用
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
];

export default eslintConfig;
