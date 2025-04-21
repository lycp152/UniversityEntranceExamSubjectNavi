/**
 * パーセンテージ計算
 * スコアからパーセンテージを計算
 *
 * @module percentage
 * @description
 * - 通常のパーセンテージ計算
 * - 重み付けパーセンテージ計算
 */

import { SUBJECT_SCORE_CONSTRAINTS } from '@/constants/constraint/subjects/subject-score';

/**
 * 通常のパーセンテージを計算
 * @param value - 値
 * @param total - 合計値
 * @returns パーセンテージ（0-100の値）
 * @example
 * - value: 75, total: 100 -> 75.0
 * - value: 0, total: 0 -> 0
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  const percentage = (value / total) * 100;
  return Number(percentage.toFixed(SUBJECT_SCORE_CONSTRAINTS.DEFAULT_DECIMAL_PLACES));
};

/**
 * パーセンテージを検証します
 * @param percentage 検証するパーセンテージ
 * @returns 検証結果
 */
export const validatePercentage = (percentage: number): boolean => {
  return (
    percentage >= SUBJECT_SCORE_CONSTRAINTS.CALCULATION_CONSTRAINTS.MIN_TOTAL_PERCENTAGE &&
    percentage <= SUBJECT_SCORE_CONSTRAINTS.CALCULATION_CONSTRAINTS.MAX_TOTAL_PERCENTAGE
  );
};

/**
 * スコアを検証します
 * @param score 検証するスコア
 * @returns 検証結果
 */
export const validateScore = (score: number): boolean => {
  return (
    score >= SUBJECT_SCORE_CONSTRAINTS.CALCULATION_CONSTRAINTS.MIN_TOTAL_SCORE &&
    score <= SUBJECT_SCORE_CONSTRAINTS.CALCULATION_CONSTRAINTS.MAX_TOTAL_SCORE
  );
};

/**
 * 重み付けパーセンテージを計算
 * @param value - 値
 * @param maxValue - 最大値
 * @param weight - 重み（0-1の値）
 * @returns 重み付けされたパーセンテージ（0-100の値）
 * @example
 * - value: 80, maxValue: 100, weight: 0.5 -> 40.0
 * - value: 0, maxValue: 0, weight: 0.5 -> 0
 */
export const calculateWeightedPercentage = (
  value: number,
  maxValue: number,
  weight: number
): number => {
  if (maxValue === 0) return 0;
  const percentage = (value / maxValue) * weight * 100;
  return Number(percentage.toFixed(SUBJECT_SCORE_CONSTRAINTS.DEFAULT_DECIMAL_PLACES));
};
