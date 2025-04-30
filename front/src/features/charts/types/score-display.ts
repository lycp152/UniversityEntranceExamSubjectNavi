/**
 * スコア表示コンポーネントの型定義
 *
 * @remarks
 * - チャート用のスコア表示コンポーネントの型定義
 * - 科目データの表示に使用
 */

import type { UISubject } from '@/types/university-subject';

/**
 * チャート用スコア表示コンポーネントのプロパティ型定義
 * @property subject - 表示する科目データ
 */
export type ChartScoreDisplayProps = {
  subject: UISubject;
};
