/**
 * チャートの共通スタイル定義
 * Rechartsライブラリを使用したチャートのスタイリングを管理
 *
 * @module chart-styles
 * @description
 * - チャートコンテナの基本スタイル
 * - 円グラフのセクター間の区切り線
 * - アクセシビリティ対応のフォーカススタイル
 * - レスポンシブ対応のレイアウト
 */

/** チャートコンテナの基本スタイル */
export const containerStyles = {
  WebkitTapHighlightColor: 'transparent',
} as const;

/** チャートコンテナのクラス名 */
export const containerClassName = 'w-full min-h-[400px] bg-transparent';

/** チャートの共通スタイル */
export const chartStyles = `
  /* チャートの基本スタイル */
  .recharts-wrapper {
    background-color: transparent;
  }

  /* 円グラフのセクタースタイル */
  .recharts-pie-sector path {
    stroke: white;
    stroke-width: 2;
  }

  /* フォーカス時のスタイル */
  .recharts-wrapper:focus-visible,
  .recharts-sector:focus-visible,
  .recharts-layer:focus-visible,
  .recharts-surface:focus-visible,
  .recharts-pie:focus-visible,
  .recharts-pie-sector:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }

  /* 不要なアウトライン（フォーカス時）の削除 */
  .recharts-wrapper,
  .recharts-sector,
  .recharts-layer,
  .recharts-surface,
  .recharts-pie,
  .recharts-pie-sector {
    outline: none;
  }
`;
