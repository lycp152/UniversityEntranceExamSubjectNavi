import { subjects } from "../../../SearchResultTable/SubjectData";

export const useCalculateScore = (subjectData: (typeof subjects)[0]) => {
  // 全体の合計点を計算する関数
  const calculateTotalScore = (subjects: typeof subjectData.subjects) =>
    Object.values(subjects).reduce(
      (sum, scores) => sum + scores.commonTest + scores.secondTest,
      0
    );

  // カテゴリー（科目）ごとの合計点を計算する関数
  const calculateCategoryTotal = (
    subjects: typeof subjectData.subjects,
    category: string
  ) =>
    Object.entries(subjects)
      .filter(([key]) => key.replace(/[RL]$/, "") === category)
      .reduce(
        (sum, [, scores]) => sum + scores.commonTest + scores.secondTest,
        0
      );

  const totalScore = calculateTotalScore(subjectData.subjects);

  return {
    totalScore,
    calculateCategoryTotal,
  };
};
