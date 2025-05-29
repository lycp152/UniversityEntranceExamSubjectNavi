/**
 * チャート関連の型定義
 *
 * @remarks
 * - 円グラフのデータ構造を定義
 * - 内側と外側の円グラフのデータ型を定義
 */

import type { DisplaySubjectScore } from '@/types/score';
import type { UISubject } from '@/types/university-subject';

/**
 * チャートコンポーネントのプロパティ型定義
 * @property detailedData - 内側の円グラフに表示する詳細データ
 * @property outerData - 外側の円グラフに表示する集計データ
 * @property isRightChart - 右側のチャートかどうかを示すフラグ（オプション）
 */
export type ChartProps = {
  detailedData: DisplaySubjectScore[];
  outerData: DisplaySubjectScore[];
  isRightChart?: boolean;
};

/**
 * 科目と試験の比較チャートコンポーネントのプロパティ型定義
 * @property subjectData - 表示する科目データ
 */
export interface SubjectExamComparisonChartProps {
  subjectData: UISubject;
}
