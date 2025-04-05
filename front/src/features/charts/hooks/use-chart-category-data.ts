/**
 * カテゴリ別の集計チャートデータを生成・管理するフック
 * 科目カテゴリーごとの合計スコアを円グラフデータに変換し、エラー情報も含めて返す
 * エラーハンドリングとメタデータの生成を統合的に管理
 */
import { useMemo } from 'react';
import type { UISubject } from '@/types/university-subjects';
import { SUBJECTS } from '@/constants/constraint/subjects';
import type { PieData, ChartResult } from '@/types/pie-chart';
import { createOuterPieData } from '@/features/charts/lib/chart-data-transformer';
import { createChartError } from '@/features/charts/utils/chart-error-factory';
import { CHART_ERROR_CODES, CHART_ERROR_MESSAGES } from '@/constants/errors/chart';
import {
  createChartMetadata,
  createChartErrorResult,
  getCategoryType,
} from '@/features/charts/utils/chart-utils';

/**
 * カテゴリ別の集計チャートデータを生成するフック
 * @param subjectData - 科目データ
 * @param totalScore - 全科目の合計点
 * @param calculateCategoryTotal - カテゴリ別合計点を計算する関数
 * @returns カテゴリ別の集計データとエラー情報
 */
export const useCategoryData = (
  subjectData: UISubject,
  totalScore: number,
  calculateCategoryTotal: (subjects: UISubject['subjects'], category: string) => number
): ChartResult<PieData> => {
  return useMemo(() => {
    /** 処理開始時間を記録 */
    const startTime = Date.now();

    /** 結果オブジェクトの初期化 */
    const result: ChartResult<PieData> = {
      data: [],
      errors: [],
      hasErrors: false,
      status: 'success',
    };

    try {
      /** 科目カテゴリごとの集計データを生成 */
      result.data = Object.values(SUBJECTS).reduce<PieData[]>((acc, subject) => {
        const category = getCategoryType(subject);
        /** 未処理のカテゴリのみ処理 */
        if (!acc.some(item => item.name === category)) {
          const total = calculateCategoryTotal(subjectData.subjects, category);
          acc.push(createOuterPieData(category, total, totalScore));
        }
        return acc;
      }, []);

      /** メタデータを生成して結果に追加 */
      result.metadata = createChartMetadata(
        startTime,
        Object.values(SUBJECTS).length,
        result.data,
        result.errors
      );
    } catch (error) {
      /** エラー発生時の処理 */
      const chartError = createChartError(
        CHART_ERROR_CODES.CALCULATION_ERROR,
        CHART_ERROR_MESSAGES[CHART_ERROR_CODES.CALCULATION_ERROR],
        'category-data',
        {
          severity: 'error',
          details: {
            originalMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        }
      );
      return createChartErrorResult([chartError]);
    }

    return result;
  }, [subjectData.subjects, totalScore, calculateCategoryTotal]);
};
