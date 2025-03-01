import {
  SubjectScores,
  BaseSubjectScore,
  TestType,
} from "@/types/subject/score";

interface SubjectScoreDetail {
  subject: string;
  commonTest: {
    score: number;
    percentage: number;
  };
  secondaryTest: {
    score: number;
    percentage: number;
  };
  total: {
    score: number;
    percentage: number;
  };
}

/**
 * 全科目の合計点を計算する
 */
const calculateTotalScore = (subjects: SubjectScores): number => {
  const scores = Object.values<BaseSubjectScore>(subjects);
  return scores.reduce(
    (sum, score) => sum + score.commonTest + score.secondTest,
    0
  );
};

/**
 * 特定のカテゴリーの合計点を計算する
 */
const calculateCategoryTotal = (
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
const calculatePercentage = (value: number, total: number): number => {
  return total === 0 ? 0 : (value / total) * 100;
};

/**
 * 特定のテスト種別の合計点を計算する
 */
const calculateTestTypeTotal = (
  subjects: SubjectScores,
  testType: TestType
): number => {
  const testTypeMap = {
    common: "commonTest",
    individual: "secondTest",
  } as const;

  return Object.values(subjects).reduce(
    (sum, score) => sum + score[testTypeMap[testType]],
    0
  );
};

/**
 * 科目ごとの詳細スコアを計算する
 */
const calculateSubjectScores = (
  subjects: SubjectScores
): SubjectScoreDetail[] => {
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

export {
  calculateTotalScore,
  calculateCategoryTotal,
  calculatePercentage,
  calculateSubjectScores,
  calculateTestTypeTotal,
};
