/**
 * チャート関連の型定義
 *
 * @remarks
 * - 円グラフのデータ構造を定義
 * - 内側と外側の円グラフのデータ型を定義
 */

import type { Payload } from 'recharts/types/component/DefaultTooltipContent';
import type { SubjectName } from '@/constants/constraint/subjects';
import type { DisplaySubjectScore } from '@/types/score';
import type { UISubject } from '@/types/university-subjects';

/**
 * 詳細な円グラフデータの型定義
 * @property name - データの名前
 * @property value - データの値
 * @property category - 科目カテゴリ
 */
interface DetailedPieData {
  name: string;
  value: number;
  category: SubjectName;
}

/**
 * 外側の円グラフデータの型定義
 * @property name - データの名前
 * @property value - データの値
 * @property percentage - パーセンテージ
 */
interface OuterPieData {
  name: string;
  value: number;
  percentage: number;
}

/**
 * チャートデータの型定義
 * @property name - データの名前
 * @property value - データの値
 * @property color - 表示色
 * @property percentage - パーセンテージ
 * @property score - スコア
 * @property category - カテゴリ（オプション）
 * @property detailedData - 詳細データ（オプション）
 * @property outerData - 外側の円グラフデータ（オプション）
 */
export interface ChartData {
  name: string;
  value: number;
  color: string;
  percentage: number;
  score: string;
  category?: string;
  detailedData?: DetailedPieData[];
  outerData?: OuterPieData[];
}

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
