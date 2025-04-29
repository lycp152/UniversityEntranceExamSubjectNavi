/**
 * 科目別の詳細チャートデータを生成・管理するフック
 *
 * このフックは以下の機能を提供します：
 * 1. 各科目のスコアを詳細な円グラフデータに変換
 * 2. エラー情報の収集と管理
 * 3. 処理時間の計測とメタデータの生成
 * 4. 共通テストと二次試験の区別に基づくデータ分類
 *
 * @example
 * const { data, errors, hasErrors } = useDetailedData(subjectData, totalScore);
 */
import { useMemo, useCallback } from 'react';
import type { UISubject } from '@/types/university-subject';
import { SUBJECTS } from '@/constants/constraint/subjects/subjects';
import { CHART_ERROR_CODES, CHART_ERROR_MESSAGES } from '@/constants/errors/chart';
import type { DetailedPieData, ChartResult, ChartError } from '@/types/pie-chart';
import { createDetailedPieData } from '@/features/charts/utils/chart-data-transformer';
import { createChartError } from '@/features/charts/utils/chart-error-factory';
import { extractScores } from '@/features/charts/utils/extractors/subject-score-extractor';
import { TEST_TYPES } from '@/types/score';
import { createChartMetadata } from '@/features/charts/utils/chart-utils';

/**
 * 詳細なチャートデータを生成するフック
 *
 * @param subjectData - 科目データ（共通テストと二次試験のスコアを含む）
 * @param totalScore - 全科目の合計点（割合計算に使用）
 * @returns ChartResult<DetailedPieData> - 詳細な円グラフデータとエラー情報
 *
 * @remarks
 * - 各科目のスコアは共通テストと二次試験に分けて処理
 * - エラーが発生した場合は、エラー情報として記録
 * - 処理時間とメタデータは自動的に生成
 */
export const useDetailedData = (
  subjectData: UISubject,
  totalScore: number
): ChartResult<DetailedPieData> => {
  /** エラー情報を生成するメモ化された関数 */
  const createError = useCallback((subjectName: string, message: string): ChartError => {
    return createChartError(
      CHART_ERROR_CODES.CALCULATION_ERROR,
      CHART_ERROR_MESSAGES[CHART_ERROR_CODES.CALCULATION_ERROR],
      subjectName,
      {
        severity: 'error',
        details: { originalMessage: message },
      }
    );
  }, []);

  /** 円グラフデータを生成するメモ化された関数 */
  const createPieData = useCallback(
    (
      name: string,
      value: number,
      type: (typeof TEST_TYPES)[keyof typeof TEST_TYPES]
    ): DetailedPieData => {
      return createDetailedPieData(name, value, totalScore, type);
    },
    [totalScore]
  );

  return useMemo(() => {
    /** 処理開始時間を記録（パフォーマンス計測用） */
    const startTime = Date.now();

    /** 全科目のデータを処理し、円グラフデータとエラー情報を集約 */
    const result = Object.values(SUBJECTS).reduce<ChartResult<DetailedPieData>>(
      (acc, subjectName: (typeof SUBJECTS)[keyof typeof SUBJECTS]) => {
        /** 科目のスコアを抽出（共通テストと二次試験） */
        const scores = subjectData.subjects[subjectName];
        const extractedScores = extractScores(scores, subjectName);

        /** 各スコアを処理し、円グラフデータまたはエラー情報として追加 */
        extractedScores.forEach(score => {
          if (score.type === 'error') {
            acc.errors.push(createError(subjectName, score.message));
          } else {
            acc.data.push(
              createPieData(
                score.name,
                score.value,
                score.type === '共通' ? TEST_TYPES.COMMON : TEST_TYPES.SECONDARY
              )
            );
          }
        });

        return acc;
      },
      { data: [], errors: [], hasErrors: false, status: 'success' }
    );

    /** エラー状態の更新とメタデータの付加 */
    result.hasErrors = result.errors.length > 0;
    result.metadata = createChartMetadata(
      startTime,
      Object.values(SUBJECTS).length,
      result.data,
      result.errors
    );

    return result;
  }, [subjectData.subjects, createError, createPieData]);
};
