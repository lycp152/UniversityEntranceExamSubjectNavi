// 科目別の詳細チャートデータを生成・管理するフック
// 各科目のスコアを詳細な円グラフデータに変換し、エラー情報も含めて返す
// 処理時間の計測とメタデータの生成も行う
import { useMemo } from 'react';
import type { UISubject } from '@/types/universities/university-subjects';
import { SUBJECTS } from '@/constants/subjects';
import { CHART_ERROR_CODES, CHART_ERROR_MESSAGES } from '@/constants/chart-error-codes';
import type { DetailedPieData, ChartResult, ChartError } from '@/types/charts/pie-chart';
import { createDetailedPieData } from '@/lib/charts/chart-data-transformer';
import { createChartError } from '@/utils/validation/chart-error-factory';
import { extractScores } from '@/utils/extractors/subject-score-extractor';
import { TEST_TYPES } from '@/types/score';
import { createChartMetadata } from '@/utils/charts/chart-utils';

export const useDetailedData = (
  subjectData: UISubject,
  totalScore: number
): ChartResult<DetailedPieData> => {
  return useMemo(() => {
    // 処理開始時間を記録
    const startTime = Date.now();

    // 全科目のデータを処理し、円グラフデータとエラー情報を集約
    const result = Object.values(SUBJECTS).reduce<ChartResult<DetailedPieData>>(
      (acc, subjectName: (typeof SUBJECTS)[keyof typeof SUBJECTS]) => {
        // 科目のスコアを抽出
        const scores = subjectData.subjects[subjectName];
        const extractedScores = extractScores(scores, subjectName);

        // 各スコアを処理し、円グラフデータまたはエラー情報として追加
        extractedScores.forEach(score => {
          if (score.type === 'error') {
            // エラーケースの処理
            const error: ChartError = createChartError(
              CHART_ERROR_CODES.CALCULATION_ERROR,
              CHART_ERROR_MESSAGES[CHART_ERROR_CODES.CALCULATION_ERROR],
              score.subjectName,
              {
                severity: 'error',
                details: { originalMessage: score.message },
              }
            );
            acc.errors.push(error);
          } else {
            // 正常ケースの処理：円グラフデータの生成
            const pieData: DetailedPieData = createDetailedPieData(
              score.name,
              score.value,
              totalScore,
              score.type === '共通' ? TEST_TYPES.COMMON : TEST_TYPES.SECONDARY
            );
            acc.data.push(pieData);
          }
        });

        return acc;
      },
      { data: [], errors: [], hasErrors: false, status: 'success' }
    );

    // エラー状態の更新とメタデータの付加
    result.hasErrors = result.errors.length > 0;
    result.metadata = createChartMetadata(
      startTime,
      Object.values(SUBJECTS).length,
      result.data,
      result.errors
    );

    return result;
  }, [subjectData.subjects, totalScore]);
};
