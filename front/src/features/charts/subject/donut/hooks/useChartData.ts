import type { Subject } from "@/lib/types/subject/subject";
import { useCalculateScore } from "./useCalculateScore";
import { useDetailedData } from "./useDetailedData";
import { useOuterData } from "@/features/charts/subject/donut/hooks/useOuterData";

export const useChartData = (subjectData: Subject) => {
  const { totalScore, calculateCategoryTotal } = useCalculateScore(subjectData);
  const detailedResult = useDetailedData(subjectData, totalScore);
  const outerData = useOuterData(
    subjectData,
    totalScore,
    calculateCategoryTotal
  );

  return {
    detailedData: detailedResult.data,
    outerData,
    errors: detailedResult.errors,
  };
};
