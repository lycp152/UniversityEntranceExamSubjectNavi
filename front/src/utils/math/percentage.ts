import { SUBJECT_SCORE_CONSTRAINTS } from '@/constants/subject-score';

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  const percentage = (value / total) * 100;
  return Number(percentage.toFixed(SUBJECT_SCORE_CONSTRAINTS.DEFAULT_DECIMAL_PLACES));
};

export const calculateWeightedPercentage = (
  value: number,
  maxValue: number,
  weight: number
): number => {
  if (maxValue === 0) return 0;
  const percentage = (value / maxValue) * weight * 100;
  return Number(percentage.toFixed(SUBJECT_SCORE_CONSTRAINTS.DEFAULT_DECIMAL_PLACES));
};
