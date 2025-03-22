import { useMemo } from "react";
import { SubjectScores } from "@/types/score/SubjectScoreType2";
import {
  calculateSubjectScores,
  calculateTotalScore,
} from "@/features/subjects/utils/services/ScoreCalculationService";
import { SubjectScoreDetail } from "@/types/score/SubjectScoreType";

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
