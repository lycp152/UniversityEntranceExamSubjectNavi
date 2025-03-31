import { FC } from 'react';
import SubjectScoreDonutChart from '@/features/universities/components/SubjectScoreDonutChart';
import styles from './ScoreDisplay.module.css';
import { UISubject } from '@/types/universities/university-subjects';

type ScoreDisplayProps = {
  subject: UISubject;
};

export const ScoreDisplay: FC<ScoreDisplayProps> = ({ subject }) => {
  return (
    <div className={styles.container}>
      <div className="flex w-full h-[400px]">
        <div className="flex-1">
          <SubjectScoreDonutChart subjectData={subject} />
        </div>
      </div>
    </div>
  );
};
