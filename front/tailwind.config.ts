import type { Config } from 'tailwindcss';

/**
 * Tailwind CSSの設定ファイル
 * テーマのカスタマイズ、プラグインの設定、コンテンツの対象範囲を管理
 *
 * @note content: コンパイル対象のファイルパターンを指定
 * @note theme: カスタムカラーやその他のテーマ設定を定義
 * @note plugins: 追加の機能を提供するプラグインを設定
 */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
} satisfies Config;
