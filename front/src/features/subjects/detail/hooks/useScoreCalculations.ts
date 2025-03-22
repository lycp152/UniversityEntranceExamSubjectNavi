import { useMemo } from "react";
import { SubjectScores, SubjectScoreDetail } from "@/types/score/score";
import {
  calculateSubjectScores,
  calculateTotalScore,
} from "@/features/subjects/utils/services/ScoreCalculationService";

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
