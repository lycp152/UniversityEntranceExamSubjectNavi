import { FC } from 'react';
import SubjectScoreDonutChart from './SubjectScoreDonutChart';
import styles from './Scores.module.css';
import { SubjectScores } from '@/lib/types';

type ScoresProps = {
  scores: SubjectScores;
};

export const Scores: FC<ScoresProps> = ({ scores }) => {
  return (
    <div className={styles.container}>
      <div className="flex w-full h-[400px]">
        <div className="flex-1">
          <SubjectScoreDonutChart />
        </div>
      </div>
    </div>
  );
};
