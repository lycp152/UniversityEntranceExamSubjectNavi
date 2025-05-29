/**
 * チャートのツールチップ表示用ユーティリティ
 *
 * @remarks
 * - ツールチップの表示形式を定義
 * - 値とラベルを配列で返却
 * - データの型安全性を確保
 *
 * @module ChartTooltip
 */

/**
 * 円グラフのツールチップを生成
 *
 * @param value - 表示する値
 * @param name - 表示するラベル名
 * @returns [値の文字列, ラベル名]の配列
 *
 * @example
 * const result = ChartTooltip(85, "数学");
 * // 戻り値: ["85点", "数学"]
 */
export const ChartTooltip = (value: number, name: string) => {
  return [`${value}点`, name];
};
