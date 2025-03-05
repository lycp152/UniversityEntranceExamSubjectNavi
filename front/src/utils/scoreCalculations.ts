import type { SubjectScores } from "../types/models";
import { isValidScore } from "./validation";
import { formatScore, formatPercentage } from "./formatting";
import { SUBJECT_MAIN_CATEGORIES } from "../lib/constants/subjects";
import { extractSubjectMainCategory } from "./subjectNameUtils";

/**
 * 全科目の合計点を計算する
 */
export const calculateTotal = (subjects: SubjectScores): number => {
  return Object.values(subjects).reduce((total, score) => {
    if (!isValidScore(score)) return total;
    return total + score.commonTest + score.secondTest;
  }, 0);
};

/**
 * カテゴリごとの合計点を計算する
 */
export const calculateCategoryTotal = (
  subjects: SubjectScores,
  category: string
): number => {
  return Object.entries(subjects).reduce((total, [subjectName, score]) => {
    if (!isValidScore(score)) return total;
    if (extractSubjectMainCategory(subjectName) !== category) return total;
    return total + score.commonTest + score.secondTest;
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
  const byCategory = SUBJECT_MAIN_CATEGORIES.reduce<
    Record<string, { total: number; percentage: number }>
  >((acc, category) => {
    const categoryTotal = calculateCategoryTotal(subjects, category);
    return {
      ...acc,
      [category]: {
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
