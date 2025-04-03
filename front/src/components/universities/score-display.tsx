import { FC } from 'react';
import SubjectScoreDonutChart from '@/components/universities/subject-score-donut-chart';
import { UISubject } from '@/types/universities/university-subjects';

/**
 * 科目スコアを表示するコンポーネント
 */
type ScoreDisplayProps = {
  /** 表示する科目データ */
  subject: UISubject;
};

export const ScoreDisplay: FC<ScoreDisplayProps> = ({ subject }) => {
  return (
    <div className="w-full">
      <div className="flex w-full h-[400px]">
        <div className="flex-1">
          <SubjectScoreDonutChart subjectData={subject} />
        </div>
      </div>
    </div>
  );
};
