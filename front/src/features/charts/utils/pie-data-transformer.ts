/**
 * 円グラフデータ変換
 * スコアデータを円グラフ表示用に変換
 *
 * @module pie-data-transformer
 * @description
 * - スコア値の円グラフデータへの変換
 * - パーセンテージの計算
 * - 表示用データの生成
 */

import { BaseTransformParams, TransformResult } from '@/types/transformers';
import { calculatePercentage } from '@/utils/math/percentage';

/**
 * スコアデータを円グラフ表示用に変換
 * @param params - 変換パラメータ
 * @param params.value - スコア値
 * @param params.totalScore - 合計スコア
 * @param params.name - データ名
 * @returns 円グラフ表示用のデータ
 * @example
 * {
 *   data: {
 *     name: "英語",
 *     value: 80,
 *     percentage: 80.0
 *   }
 * }
 */
export const transformToPieData = ({
  value,
  totalScore,
  name,
}: BaseTransformParams): TransformResult => ({
  data: {
    name,
    value,
    percentage: calculatePercentage(value, totalScore),
  },
});
