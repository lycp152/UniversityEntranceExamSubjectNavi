/**
 * チャートの共通スタイル定義
 * 円グラフのセクター間の区切り線を定義
 */

/** チャートコンテナの基本スタイル */
export const containerStyles = {
  WebkitTapHighlightColor: "transparent",
} as const;

/** チャートコンテナのクラス名 */
export const containerClassName = "w-full h-[500px] bg-transparent p-4";

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
