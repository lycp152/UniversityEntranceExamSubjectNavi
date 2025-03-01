import {
  SubjectScores,
  BaseSubjectScore,
  TestType,
  TEST_TYPES,
} from "@/types/subject/score";
import { calculateTestTypeTotal } from "./base";

/**
 * 特定のカテゴリーの合計点を計算する
 * @param subjects - 科目ごとのスコアデータ
 * @param targetCategory - 計算対象のカテゴリー（例: '英語'）
 * @param testType - テストの種別（指定しない場合は全テストの合計を計算）
 * @returns カテゴリーの合計点
 * @example
 * ```ts
 * // 英語の全テスト合計点
 * calculateCategoryTotal(subjects, '英語')
 *
 * // 英語の共通テスト合計点
 * calculateCategoryTotal(subjects, '英語', 'commonTest')
 *
 * // 英語の二次試験合計点
 * calculateCategoryTotal(subjects, '英語', 'secondTest')
 * ```
 */
export const calculateCategoryTotal = (
  subjects: SubjectScores,
  targetCategory: string,
  testType?: TestType
): number => {
  const categorySubjects = Object.entries(subjects).reduce<
    Record<string, BaseSubjectScore>
  >((acc, [key, score]) => {
    if (key.startsWith(targetCategory)) {
      acc[key] = score;
    }
    return acc;
  }, {}) as SubjectScores;

  if (testType) {
    return calculateTestTypeTotal(categorySubjects, testType);
  }

  return (
    calculateTestTypeTotal(categorySubjects, TEST_TYPES.COMMON) +
    calculateTestTypeTotal(categorySubjects, TEST_TYPES.INDIVIDUAL)
  );
};
