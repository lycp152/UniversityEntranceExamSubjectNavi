import { SubjectScores, ScoreEntry } from "../types/subjects";
import { getCategoryFromSubject } from "./subjectNameParser";

/**
 * 全科目の合計点を計算する
 */
export const calculateTotalScore = (subjects: SubjectScores): number => {
  const scores = Object.values<ScoreEntry>(subjects);
  return scores.reduce(
    (sum, score) => sum + score.commonTest + score.secondTest,
    0
  );
};

/**
 * 特定のカテゴリーの合計点を計算する
 */
export const calculateCategoryTotal = (
  subjects: SubjectScores,
  targetCategory: string
): number => {
  const entries = Object.entries<ScoreEntry>(subjects);
  return entries
    .filter(([key]) => getCategoryFromSubject(key) === targetCategory)
    .reduce((sum, [, score]) => sum + score.commonTest + score.secondTest, 0);
};

/**
 * パーセンテージを計算する
 */
export const calculatePercentage = (value: number, total: number): number => {
  return (value / total) * 100;
};
