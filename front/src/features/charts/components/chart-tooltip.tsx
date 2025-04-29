/**
 * チャートのツールチップ表示用ユーティリティ
 *
 * @remarks
 * - ツールチップの表示形式を定義
 * - パーセンテージの表示をサポート
 * - 値とラベルを配列で返却
 * - データの型安全性を確保
 *
 * @module ChartTooltip
 */

import { TooltipPayload } from '../types/chart';

/**
 * 円グラフのツールチップを生成
 *
 * @param value - 表示する値
 * @param name - 表示するラベル名
 * @param entry - ツールチップのデータエントリ（オプショナル）
 * @returns [値の文字列, ラベル名]の配列
 *
 * @example
 * const result = ChartTooltip(85, "数学", { payload: { percentage: 0.25 } });
 * // 戻り値: ["85点 (25.0%)", "数学"]
 */
export const ChartTooltip = (value: number, name: string, entry?: TooltipPayload) => {
  const percentage =
    entry?.payload?.percentage !== undefined
      ? ` (${(entry.payload.percentage * 100).toFixed(1)}%)`
      : '';
  return [`${value}点${percentage}`, name];
};
