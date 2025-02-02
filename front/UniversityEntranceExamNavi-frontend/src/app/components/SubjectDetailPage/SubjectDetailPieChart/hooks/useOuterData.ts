import { subjects } from "../../../SearchResultTable/SubjectData";
import { SUBJECT_ORDER } from "../constants";
import { PieData } from "../types";
import { createOuterPieData } from "../utils/dataTransformers";
import { getCategoryFromSubject } from "../utils/stringTransformers";

export const useOuterData = (
  subjectData: (typeof subjects)[0],
  totalScore: number,
  calculateCategoryTotal: (
    subjects: typeof subjectData.subjects,
    category: string
  ) => number
) => {
  return SUBJECT_ORDER.reduce((acc, subject) => {
    const category = getCategoryFromSubject(subject);
    if (!acc.some((item) => item.name === category)) {
      const total = calculateCategoryTotal(subjectData.subjects, category);
      acc.push(createOuterPieData(category, total, totalScore));
    }
    return acc;
  }, [] as PieData[]);
};
