/**
 * チャート関連の型定義
 *
 * @remarks
 * - 円グラフのデータ構造を定義
 * - 内側と外側の円グラフのデータ型を定義
 */

import type { Payload } from 'recharts/types/component/DefaultTooltipContent';
import type { DisplaySubjectScore } from '@/types/score';
import type { UISubject } from '@/types/university-subjects';

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
 * ツールチップのペイロード型定義
 * @property value - 表示する値
 * @property name - 表示するラベル名
 * @property payload - 追加のデータペイロード
 * @property payload.percentage - パーセンテージ値（オプション）
 */
export type TooltipPayload = Payload<number, string>;

/**
 * スコア表示コンポーネントのプロパティ型定義
 * @property subject - 表示する科目データ
 */
export type ScoreDisplayProps = {
  subject: UISubject;
};

/**
 * 科目と試験の比較チャートコンポーネントのプロパティ型定義
 * @property subjectData - 表示する科目データ
 */
export interface SubjectExamComparisonChartProps {
  subjectData: UISubject;
}
