/**
 * 科目スコアを表示するコンポーネント
 *
 * @remarks
 * - 科目データの視覚化を提供
 * - レスポンシブなレイアウトを実装
 * - 科目と試験の比較チャートを表示
 */
import { FC } from 'react';
import SubjectExamComparisonChart from './subject-exam-comparison-chart';
import { ScoreDisplayProps } from '../types/chart';

/**
 * 科目スコアを表示するコンポーネント
 *
 * @param props - コンポーネントのプロパティ
 * @param props.subject - 表示する科目データ
 *
 * @returns 科目スコア表示のReact要素
 */
export const ScoreDisplay: FC<ScoreDisplayProps> = ({ subject }) => {
  return (
    <div className="w-full">
      <div className="flex w-full h-[400px]">
        <div className="flex-1">
          <SubjectExamComparisonChart subjectData={subject} />
        </div>
      </div>
    </div>
  );
};
