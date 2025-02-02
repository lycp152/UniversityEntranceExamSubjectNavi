import type { Subject, SubjectScores } from '@/features/data/types';
import { SUBJECT_DISPLAY_ORDER } from '@/features/data/constants/subjects';
import { PieData } from '../types/chart';
import { createOuterPieData } from '../utils/dataTransformers';
import { extractSubjectMainCategory } from '@/features/data/utils/subjectNameUtils';

export const useOuterData = (
  subjectData: Subject,
  totalScore: number,
  calculateCategoryTotal: (subjects: SubjectScores, category: string) => number
) => {
  return SUBJECT_DISPLAY_ORDER.reduce((acc, subject) => {
    const category = extractSubjectMainCategory(subject);
    if (!acc.some((item) => item.name === category)) {
      const total = calculateCategoryTotal(subjectData.subjects, category);
      acc.push(createOuterPieData(category, total, totalScore));
    }
    return acc;
  }, [] as PieData[]);
};
