import type { UISubject } from "@/types/universities/subjects";
import { SUBJECT_DISPLAY_ORDER } from "@/constants/subjects";
import { PieData } from "@/types/charts/pie-chart";
import { createOuterPieData } from "@/utils/builders/pie-chart-data-builder";
import { extractSubjectMainCategory } from "@/utils/formatters/subject-name";

export const useOuterData = (
  subjectData: UISubject,
  totalScore: number,
  calculateCategoryTotal: (
    subjects: UISubject["subjects"],
    category: string
  ) => number
) => {
  return SUBJECT_DISPLAY_ORDER.reduce((acc, subject) => {
    const category = extractSubjectMainCategory(subject);
    if (!acc.some((item) => item.name === category)) {
      const total = calculateCategoryTotal(subjectData.subjects, category);
      acc.push(createOuterPieData(category, total, totalScore));
    }
    return acc;
  }, [] as PieData[]);
};
