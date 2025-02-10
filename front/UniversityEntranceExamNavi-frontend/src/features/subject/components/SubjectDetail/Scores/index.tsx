import { FC } from 'react';
import SubjectScoreDonutChart from './SubjectScoreDonutChart';
import styles from './Scores.module.css';
import { Subject } from '@/lib/types';

type ScoresProps = {
  scores: Subject;
};

export const Scores: FC<ScoresProps> = ({ scores }) => {
  return (
    <div className={styles.container}>
      <div className="flex w-full h-[400px]">
        <div className="flex-1">
          <SubjectScoreDonutChart subjectData={scores} />
        </div>
      </div>
    </div>
  );
};
