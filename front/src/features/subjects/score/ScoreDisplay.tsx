import { FC } from "react";
import SubjectScoreDonutChart from "@/features/charts/subject/donut/SubjectScoreDonutChart";
import styles from "./ScoreDisplay.module.css";
import { Subject } from "@/types/subjects/subject";

type ScoreDisplayProps = {
  subject: Subject;
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
