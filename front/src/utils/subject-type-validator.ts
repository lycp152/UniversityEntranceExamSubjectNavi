/**
 * 科目タイプバリデーション
 * 科目の種類と表示順序を管理
 *
 * @module subject-type-validator
 * @description
 * - 共通科目の判定
 * - 二次科目の判定
 * - 科目カテゴリの取得
 * - 表示順序の比較
 */

import { SUBJECT_CATEGORIES } from '@/constants/constraint/subjects/subject-categories';
import { EXAM_TYPES } from '@/constants/constraint/exam-types';
import { CHART_ERROR_CODES, CHART_ERROR_MESSAGES } from '@/constants/errors/chart';
import { createChartError } from '@/features/charts/utils/chart-error-factory';

/**
 * 共通科目かどうかを判定
 * @param name - 科目名
 * @returns 共通科目かどうか
 * @throws {Error} 科目名が空の場合
 */
export const isCommonSubject = (name: string): boolean => {
  if (!name) {
    throw createChartError(
      CHART_ERROR_CODES.INVALID_DATA_FORMAT,
      CHART_ERROR_MESSAGES.INVALID_DATA_FORMAT,
      'error'
    );
  }
  return name.includes(EXAM_TYPES.COMMON.name);
};

/**
 * 二次科目かどうかを判定
 * @param name - 科目名
 * @returns 二次科目かどうか
 * @throws {Error} 科目名が空の場合
 */
export const isSecondarySubject = (name: string): boolean => {
  if (!name) {
    throw createChartError(
      CHART_ERROR_CODES.INVALID_DATA_FORMAT,
      CHART_ERROR_MESSAGES.INVALID_DATA_FORMAT,
      'error'
    );
  }
  return name.includes(EXAM_TYPES.SECONDARY.name);
};

/**
 * 科目名から基本カテゴリを取得
 * @param name - 科目名
 * @returns 科目の基本カテゴリ
 * @throws {Error} 科目名が空の場合
 */
export const getSubjectBaseCategory = (name: string): string => {
  if (!name) {
    throw createChartError(
      CHART_ERROR_CODES.INVALID_DATA_FORMAT,
      CHART_ERROR_MESSAGES.INVALID_DATA_FORMAT,
      'error'
    );
  }

  // キャッシュを使用してパフォーマンスを最適化
  const cachedCategory = SUBJECT_CATEGORIES[name];
  if (cachedCategory) {
    return cachedCategory.category;
  }

  const found = Object.values(SUBJECT_CATEGORIES).find(subject => name.includes(subject.category));
  return found?.category ?? SUBJECT_CATEGORIES.ENGLISH.category;
};

/**
 * 科目の表示順を比較
 * @param a - 比較対象の科目名1
 * @param b - 比較対象の科目名2
 * @returns 比較結果（負の値: aが先、正の値: bが先、0: 同じ順序）
 * @throws {Error} 科目名が空の場合
 */
export const compareSubjectOrder = (a: string, b: string): number => {
  if (!a || !b) {
    throw createChartError(
      CHART_ERROR_CODES.INVALID_DATA_FORMAT,
      CHART_ERROR_MESSAGES.INVALID_DATA_FORMAT,
      'error'
    );
  }

  // キャッシュを使用してパフォーマンスを最適化
  const aIndex = Object.values(SUBJECT_CATEGORIES).findIndex(subject =>
    a.includes(subject.category)
  );
  const bIndex = Object.values(SUBJECT_CATEGORIES).findIndex(subject =>
    b.includes(subject.category)
  );

  return aIndex - bIndex;
};
