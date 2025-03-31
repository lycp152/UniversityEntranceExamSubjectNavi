/**
 * チャートの値のフォーマット処理
 * スコアやパーセンテージを表示用にフォーマット
 *
 * @module chart-value-formatter
 * @description
 * - スコアのフォーマット処理
 * - パーセンテージのフォーマット処理
 */

/**
 * スコアを表示用にフォーマット
 * @param score - フォーマット対象のスコア
 * @returns 小数点第1位までのフォーマットされたスコア
 * @example
 * - 85.67 -> "85.7"
 * - 90.0 -> "90.0"
 */
export const formatScore = (score: number): string => {
  return score.toFixed(1);
};

/**
 * パーセンテージを表示用にフォーマット
 * @param percentage - フォーマット対象のパーセンテージ（0-1の値）
 * @returns パーセント記号付きの小数点第1位までのフォーマットされた値
 * @example
 * - 0.8567 -> "85.7%"
 * - 0.9 -> "90.0%"
 */
export const formatPercentage = (percentage: number): string => {
  return `${(percentage * 100).toFixed(1)}%`;
};
