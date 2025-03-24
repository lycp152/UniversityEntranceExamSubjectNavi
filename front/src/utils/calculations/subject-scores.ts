import { SubjectScores } from "@/types/api/subjects";
import { getCategoryFromSubject } from "@/utils/extractors/subject-name-extractor2";

export const calculateTotalScore = (subjects: SubjectScores): number =>
  Object.values(subjects).reduce(
    (sum, scores) => sum + scores.commonTest + scores.secondTest,
    0
  );

export const calculateCategoryTotal = (
  subjects: SubjectScores,
  targetCategory: string
): number =>
  Object.entries(subjects)
    .filter(([key]) => getCategoryFromSubject(key) === targetCategory)
    .reduce(
      (sum, [, scores]) => sum + scores.commonTest + scores.secondTest,
      0
    );

export const calculatePercentage = (value: number, total: number): number => {
  return (value / total) * 100;
};
