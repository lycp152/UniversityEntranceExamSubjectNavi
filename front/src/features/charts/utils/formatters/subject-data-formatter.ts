/**
 * 科目データのフォーマット処理
 * 科目データを表示用に変換
 *
 * @module subject-data-formatter
 * @description
 * - 科目データの変換処理
 * - 表示用データの生成
 */

import { TransformedSubjectData } from '@/features/charts/types/transformers';
import {
  removeSubjectNamePrefix,
  formatWithTestType,
} from '@/features/charts/utils/formatters/subject-name-display-formatter';
import { getCategoryFromSubject } from '@/features/charts/utils/extractors/subject-name-extractor';
import { ExamType } from '@/constants/constraint/exam-types';

/**
 * 科目データを表示用に変換
 * @param subjectName - 科目名
 * @param testType - テスト種別
 * @returns 変換された科目データ
 * @throws {Error} 科目名が空の場合
 * @example
 * {
 *   name: "英語R（二次）",
 *   displayName: "R（二次）",
 *   category: "英語",
 *   testTypeId: 0,
 *   percentage: 0,
 *   displayOrder: 0
 * }
 */
export const transformSubjectData = (
  subjectName: string,
  testType: ExamType
): TransformedSubjectData => {
  if (!subjectName) {
    throw new Error('科目名は必須です');
  }

  const category = getCategoryFromSubject(subjectName);
  const baseDisplayName = removeSubjectNamePrefix(subjectName);

  return {
    name: formatWithTestType(subjectName, testType),
    displayName: formatWithTestType(baseDisplayName, testType),
    category,
    testTypeId: 0,
    percentage: 0,
    displayOrder: 0,
  };
};
