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

import { BaseTransformParams, TransformResult } from '@/features/charts/types/transformers';
import { calculatePercentage } from '@/utils/percentage';
import { CHART_ERROR_CODES, CHART_ERROR_MESSAGES } from '@/constants/errors/chart';
import { createChartError } from '@/features/charts/utils/chart-error-factory';

/**
 * スコアデータを円グラフ表示用に変換
 * @param params - 変換パラメータ
 * @param params.value - スコア値
 * @param params.totalScore - 合計スコア
 * @param params.name - データ名
 * @returns 円グラフ表示用のデータ
 * @throws {Error} スコア値が不正な場合
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
}: BaseTransformParams): TransformResult => {
  // 入力値の検証
  if (value < 0) {
    return {
      data: { name, value, percentage: 0 },
      error: createChartError(
        CHART_ERROR_CODES.INVALID_DATA_FORMAT,
        CHART_ERROR_MESSAGES.INVALID_DATA_FORMAT,
        'error'
      ),
    };
  }

  // 合計スコアの検証
  if (totalScore <= 0) {
    return {
      data: { name, value, percentage: 0 },
      error: createChartError(
        CHART_ERROR_CODES.INVALID_PERCENTAGE,
        CHART_ERROR_MESSAGES.INVALID_PERCENTAGE,
        'error'
      ),
    };
  }

  // パーセンテージの計算
  const percentage = calculatePercentage(value, totalScore);

  // 結果の検証
  if (percentage < 0 || percentage > 100) {
    return {
      data: { name, value, percentage: 0 },
      error: createChartError(
        CHART_ERROR_CODES.INVALID_PERCENTAGE,
        CHART_ERROR_MESSAGES.INVALID_PERCENTAGE,
        'error'
      ),
    };
  }

  return {
    data: {
      name,
      value,
      percentage,
    },
  };
};
