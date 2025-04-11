/**
 * PostCSSの設定ファイル
 * Tailwind CSSとAutoprefixerの設定を管理
 *
 * @note tailwindcss: Tailwind CSSの処理を有効化
 * @note autoprefixer: ベンダープレフィックスの自動追加を有効化
 */

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
