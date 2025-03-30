import type { SubjectScores } from '@/types/score';
import { isValidScore } from '@/utils/validation/score-validator';
import { formatScore, formatPercentage } from '@/utils/formatters/chart-value-formatter';
import { SUBJECT_CATEGORIES } from '@/constants/subjects';
import { extractSubjectMainCategory } from '@/utils/formatters/subject-name-display-formatter';

/**
 * 全科目の合計点を計算する
 */
export const calculateTotal = (subjects: SubjectScores): number => {
  return Object.values(subjects).reduce((total, score) => {
    if (!isValidScore(score)) return total;
    const subjectScore = score;
    return total + subjectScore.commonTest + subjectScore.secondTest;
  }, 0);
};

/**
 * カテゴリごとの合計点を計算する
 */
export const calculateCategoryTotal = (subjects: SubjectScores, category: string): number => {
  return Object.entries(subjects).reduce((total, [subjectName, score]) => {
    if (!isValidScore(score)) return total;
    if (extractSubjectMainCategory(subjectName) !== category) return total;
    const subjectScore = score;
    return total + subjectScore.commonTest + subjectScore.secondTest;
  }, 0);
};

/**
 * パーセンテージを計算する
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return value / total;
};

/**
 * 全ての計算結果を返す
 */
export const calculateAll = (subjects: SubjectScores) => {
  const total = calculateTotal(subjects);
  const byCategory = Object.values(SUBJECT_CATEGORIES).reduce<
    Record<string, { total: number; percentage: number }>
  >((acc, category) => {
    const categoryTotal = calculateCategoryTotal(subjects, category.category);
    return {
      ...acc,
      [category.category]: {
        total: categoryTotal,
        percentage: calculatePercentage(categoryTotal, total),
      },
    };
  }, {});

  return {
    total,
    byCategory,
    formatted: {
      total: formatScore(total),
      percentage: formatPercentage(1),
    },
  };
};
