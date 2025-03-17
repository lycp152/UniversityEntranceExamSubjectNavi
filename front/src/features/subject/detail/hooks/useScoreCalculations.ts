import { useMemo } from "react";
import { SubjectScores } from "@/types/subject/subjects";
import {
  calculateSubjectScores,
  calculateTotalScore,
} from "@/utils/subject/score/scoreCalculations";
import { SubjectScoreDetail } from "@/types/subject/common";

export const useScoreCalculations = (scores: SubjectScores) => {
  const totalScore = useMemo(() => calculateTotalScore(scores), [scores]);
  const subjectScores = useMemo(
    () => calculateSubjectScores(scores),
    [scores]
  ) as SubjectScoreDetail[];

  return {
    totalScore,
    subjectScores,
  };
};
