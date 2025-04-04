// チャートデータを統合的に管理するフック
// 詳細データ（個別科目）と集計データ（カテゴリ別）を統合し、エラー情報も含めて返す
// 各データの生成と集計、エラーハンドリングを一元管理
import type { UISubject } from '@/types/universities/university-subjects';
import type { ChartData } from '@/types/charts/pie-chart';
import { useCalculateScore } from '@/hooks/subject/use-subject-score';
import { useDetailedData } from '@/hooks/utils/use-chart-detailed-data';
import { useCategoryData } from '@/hooks/utils/use-chart-category-data';
import { createChartErrorResult } from '@/utils/charts/chart-utils';

export const useChartData = (subjectData: UISubject): ChartData => {
  // スコア計算フックから合計点と科目カテゴリごとの集計を取得
  const { totalScore, calculateCategoryTotal } = useCalculateScore(subjectData);

  // 詳細データ（個別科目）と集計データ（カテゴリ別）を生成
  const detailedResult = useDetailedData(subjectData, totalScore);
  const categoryResult = useCategoryData(subjectData, totalScore, calculateCategoryTotal);

  // 両方のデータソースからエラーを集約
  const allErrors = [...detailedResult.errors, ...categoryResult.errors];
  const errorInfo = createChartErrorResult(allErrors);

  // 統合されたチャートデータを返却
  return {
    detailedData: detailedResult.data,
    outerData: categoryResult.data,
    ...errorInfo,
  };
};
