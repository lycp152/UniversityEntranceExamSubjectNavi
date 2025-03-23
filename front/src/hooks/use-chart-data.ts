import type { UISubject } from "@/types/universities/subjects";
import { useCalculateScore } from "@/hooks/use-calculate-score";
import { useDetailedData } from "@/hooks/use-chart-detailed-data";
import { useOuterData } from "@/hooks/use-outer-data";

export const useChartData = (subjectData: UISubject) => {
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
