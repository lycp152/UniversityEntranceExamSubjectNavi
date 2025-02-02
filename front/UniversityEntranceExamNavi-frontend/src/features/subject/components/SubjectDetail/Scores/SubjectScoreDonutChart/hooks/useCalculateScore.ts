import type { Subject, SubjectScores } from '@/features/data/types';
import { calculateTotal, calculateCategoryTotal } from '@/features/data/utils/scoreCalculations';

export const useCalculateScore = (subjectData: Subject) => {
  const totalScore = calculateTotal(subjectData.subjects);

  const getCategoryTotal = (subjects: SubjectScores, category: string): number =>
    calculateCategoryTotal(subjects, category);

  return {
    totalScore,
    getCategoryTotal,
  };
};
