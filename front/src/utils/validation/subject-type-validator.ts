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

import { EXAM_TYPES, SUBJECT_CATEGORIES } from '@/constants/subjects';

/**
 * 共通科目かどうかを判定
 * @param name - 科目名
 * @returns 共通科目かどうか
 */
export const isCommonSubject = (name: string): boolean => name.includes(EXAM_TYPES.COMMON.name);

/**
 * 二次科目かどうかを判定
 * @param name - 科目名
 * @returns 二次科目かどうか
 */
export const isSecondarySubject = (name: string): boolean =>
  name.includes(EXAM_TYPES.SECONDARY.name);

/**
 * 科目名から基本カテゴリを取得
 * @param name - 科目名
 * @returns 科目の基本カテゴリ
 */
export const getSubjectBaseCategory = (name: string): string => {
  const found = Object.values(SUBJECT_CATEGORIES).find(subject => name.includes(subject.category));
  return found?.category ?? SUBJECT_CATEGORIES.ENGLISH.category;
};

/**
 * 科目の表示順を比較
 * @param a - 比較対象の科目名1
 * @param b - 比較対象の科目名2
 * @returns 比較結果（負の値: aが先、正の値: bが先、0: 同じ順序）
 */
export const compareSubjectOrder = (a: string, b: string): number => {
  const aIndex = Object.values(SUBJECT_CATEGORIES).findIndex(subject =>
    a.includes(subject.category)
  );
  const bIndex = Object.values(SUBJECT_CATEGORIES).findIndex(subject =>
    b.includes(subject.category)
  );
  return aIndex - bIndex;
};
