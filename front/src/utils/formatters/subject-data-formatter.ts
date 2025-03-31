/**
 * 科目データのフォーマット処理
 * 科目データを表示用に変換
 *
 * @module subject-data-formatter
 * @description
 * - 科目データの変換処理
 * - 表示用データの生成
 */

import { TestType } from '@/types/score';
import { TransformedSubjectData } from '@/types/charts/transformers';
import {
  extractSubjectMainCategory,
  removeSubjectNamePrefix,
  formatWithTestType,
} from '@/utils/formatters/subject-name-display-formatter';

/**
 * 科目データを表示用に変換
 * @param subjectName - 科目名
 * @param testType - テスト種別
 * @returns 変換された科目データ
 * @example
 * {
 *   name: "英語（共通）",
 *   displayName: "英語（共通）",
 *   category: "英語",
 *   testTypeId: 0,
 *   percentage: 0,
 *   displayOrder: 0
 * }
 */
export const transformSubjectData = (
  subjectName: string,
  testType: TestType
): TransformedSubjectData => {
  const category = extractSubjectMainCategory(subjectName);
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
