import { useMemo } from 'react';
import { SubjectScores } from '@/lib/types/models';
import {
  calculateSubjectScores,
  calculateTotalScore,
} from '@/utils/subject/score/scoreCalculations';
import { SubjectScoreDetail } from '../types/score';

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
