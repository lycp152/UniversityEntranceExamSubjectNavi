import { SubjectScores, BaseSubjectScore } from "@/types/score";

/**
 * 全科目の合計点を計算する
 */
export const calculateTotalScore = (subjects: SubjectScores): number => {
  const scores = Object.values<BaseSubjectScore>(subjects);
  return scores.reduce(
    (sum, score) => sum + score.commonTest + score.secondTest,
    0
  );
};

/**
 * 特定のカテゴリの合計点を計算する
 */
export const calculateCategoryTotal = (
  subjects: SubjectScores,
  targetCategory: string
): number => {
  const entries = Object.entries<BaseSubjectScore>(subjects);
  return entries
    .filter(([key]) => key.startsWith(targetCategory))
    .reduce((sum, [, score]) => sum + score.commonTest + score.secondTest, 0);
};

/**
 * パーセンテージを計算する
 */
export const calculatePercentage = (value: number, total: number): number => {
  return total === 0 ? 0 : (value / total) * 100;
};

/**
 * 科目ごとのスコアを計算する
 */
export const calculateSubjectScores = (subjects: SubjectScores) => {
  const totalScore = calculateTotalScore(subjects);

  return Object.entries(subjects).map(([subject, scores]) => {
    const subjectTotal = scores.commonTest + scores.secondTest;
    return {
      subject,
      commonTest: {
        score: scores.commonTest,
        percentage: calculatePercentage(scores.commonTest, totalScore),
      },
      secondaryTest: {
        score: scores.secondTest,
        percentage: calculatePercentage(scores.secondTest, totalScore),
      },
      total: {
        score: subjectTotal,
        percentage: calculatePercentage(subjectTotal, totalScore),
      },
    };
  });
};
