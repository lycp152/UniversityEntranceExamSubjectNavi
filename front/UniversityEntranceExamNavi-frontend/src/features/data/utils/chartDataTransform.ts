import type {
  SubjectScores,
  ValidationResult,
  SubjectNameDisplayMapping,
  ChartData,
} from '../types';
import { createValidationResult } from './validation';
import { formatScore, formatPercentage } from './formatting';
import { SUBJECT_NAME_DISPLAY_MAPPING, SUBJECT_CATEGORY_COLORS } from '../constants/subjects';

/**
 * 共通のチャートデータ変換関数
 */
const createChartData = (
  name: string,
  value: number,
  color: string,
  totalScore: number,
  category?: string
): ChartData => ({
  name,
  value,
  color,
  percentage: formatPercentage(value / totalScore),
  score: formatScore(value),
  ...(category && { category }),
});

/**
 * 詳細データを生成する
 */
export const transformDetailedData = (
  subjects: SubjectScores,
  totalScore: number
): ValidationResult<ChartData[]> => {
  try {
    const data = Object.entries(subjects).map(([subject, scores]) => {
      const displayName =
        SUBJECT_NAME_DISPLAY_MAPPING[subject as keyof SubjectNameDisplayMapping] || subject;
      const category = subject.replace(/[RL]$/, '') as keyof typeof SUBJECT_CATEGORY_COLORS;
      const color = SUBJECT_CATEGORY_COLORS[category] || '#000000';
      const value = scores.commonTest + scores.secondTest;

      return createChartData(displayName, value, color, totalScore, category);
    });

    return createValidationResult(true, data);
  } catch (error) {
    return createValidationResult(false, [], [(error as Error).message]);
  }
};

/**
 * 外側のチャートデータを生成する
 */
export const transformOuterData = (
  subjects: SubjectScores,
  totalScore: number,
  getCategoryTotal: (subjects: SubjectScores, category: string) => number
): ChartData[] => {
  return Object.entries(SUBJECT_CATEGORY_COLORS).map(([category, color]) => {
    const displayName =
      SUBJECT_NAME_DISPLAY_MAPPING[category as keyof SubjectNameDisplayMapping] || category;
    const value = getCategoryTotal(subjects, category);

    return createChartData(displayName, value, color, totalScore, category);
  });
};
