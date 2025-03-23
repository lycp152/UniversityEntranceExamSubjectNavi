import { SubjectScores, TestType } from "@/types/score";

/**
 * 全科目の合計点を計算する
 * @param subjects - 科目ごとのスコアデータ
 * @returns 全科目の合計点
 */
export const calculateTotalScore = (subjects: SubjectScores): number => {
  return Object.values(subjects).reduce((total, subject) => {
    return total + subject.commonTest + subject.secondTest;
  }, 0);
};

/**
 * 特定のテスト種別の合計点を計算する
 * @param subjects - 科目ごとのスコアデータ
 * @param testType - テストの種別（'commonTest' または 'secondTest'）
 * @returns 指定されたテスト種別の合計点
 */
export const calculateTestTypeTotal = (
  subjects: SubjectScores,
  testType: TestType
): number => {
  const testTypeMap = {
    common: "commonTest",
    individual: "secondTest",
  } as const;

  return Object.values(subjects).reduce((total, subject) => {
    return total + subject[testTypeMap[testType]];
  }, 0);
};

/**
 * 得点の割合（パーセンテージ）を計算する
 * @param score - 実際の得点
 * @param maxScore - 満点
 * @returns 割合（パーセンテージ）
 */
export const calculatePercentage = (
  score: number,
  maxScore: number
): number => {
  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
};
