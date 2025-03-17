import type { Subject } from "@/lib/types/subject/subject";
import { SUBJECT_DISPLAY_ORDER } from "@/lib/constants/subjects";
import { PieData } from "@/types/subject/chart";
import { createOuterPieData } from "@/features/charts/subject/donut/utils/pieChartTransformers";
import { extractSubjectMainCategory } from "@/utils/subjectNameUtils";

export const useOuterData = (
  subjectData: Subject,
  totalScore: number,
  calculateCategoryTotal: (
    subjects: Subject["subjects"],
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
