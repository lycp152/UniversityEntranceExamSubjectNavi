import type { Subject, SubjectScores } from '@/features/data/types';
import { extractSubjectMainCategory } from '@/features/data/utils/subjectNameUtils';

export const useCalculateScore = (subjectData: Subject) => {
  // 全体の合計点を計算する関数
  const calculateTotalScore = (subjects: SubjectScores) =>
    Object.values(subjects).reduce((sum, scores) => sum + scores.commonTest + scores.secondTest, 0);

  // カテゴリー（科目）ごとの合計点を計算する関数
  const calculateCategoryTotal = (subjects: SubjectScores, category: string) =>
    Object.entries(subjects)
      .filter(([key]) => extractSubjectMainCategory(key) === category)
      .reduce((sum, [, scores]) => sum + scores.commonTest + scores.secondTest, 0);

  const totalScore = calculateTotalScore(subjectData.subjects);

  return {
    totalScore,
    calculateCategoryTotal,
  };
};
