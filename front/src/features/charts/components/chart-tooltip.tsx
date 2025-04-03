/**
 * 円グラフのツールチップ表示用ユーティリティ
 *
 * @remarks
 * - ツールチップの表示形式を定義
 * - パーセンテージの表示をサポート
 * - 値とラベルを配列で返却
 * - データの型安全性を確保
 *
 * @module ChartTooltip
 */

import { Payload } from 'recharts/types/component/DefaultTooltipContent';

/**
 * ツールチップのペイロード型定義
 * @typedef {Object} TooltipPayload
 * @property {number} value - 表示する値
 * @property {string} name - 表示するラベル名
 * @property {Object} payload - 追加のデータペイロード
 * @property {number} [payload.percentage] - パーセンテージ値（オプション）
 */
export type TooltipPayload = Payload<number, string>;

/**
 * 円グラフのツールチップを生成する関数
 *
 * @remarks
 * - 値とパーセンテージを組み合わせて表示
 * - パーセンテージが存在する場合のみ表示
 * - 小数点以下1桁まで表示
 *
 * @param {number} value - 表示する値
 * @param {string} name - 表示するラベル名
 * @param {TooltipPayload} entry - ツールチップのデータエントリ
 *
 * @returns {[string, string]} [値の文字列, ラベル名]の配列
 *
 * @example
 * const result = ChartTooltip(85, "数学", { payload: { percentage: 0.25 } });
 * // 戻り値: ["85点 (25.0%)", "数学"]
 */
export const ChartTooltip = (value: number, name: string, entry: TooltipPayload) => {
  const percentage = entry?.payload?.percentage ? ` (${entry.payload.percentage.toFixed(1)}%)` : '';
  return [`${value}点${percentage}`, name];
};
