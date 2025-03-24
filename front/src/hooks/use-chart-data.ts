import type { UISubject } from "@/types/universities/subjects";
import type { ChartData } from "@/types/charts";
import { useCalculateScore } from "@/hooks/use-calculate-score";
import { useDetailedData } from "@/hooks/use-chart-detailed-data";
import { useOuterData } from "@/hooks/use-outer-data";
import { useChartError } from "@/hooks/use-chart-error";

export const useChartData = (subjectData: UISubject): ChartData => {
  const { totalScore, calculateCategoryTotal } = useCalculateScore(subjectData);
  const detailedResult = useDetailedData(subjectData, totalScore);
  const outerResult = useOuterData(
    subjectData,
    totalScore,
    calculateCategoryTotal
  );

  const errorInfo = useChartError([
    ...detailedResult.errors,
    ...outerResult.errors,
  ]);

  return {
    detailedData: detailedResult.data,
    outerData: outerResult.data,
    ...errorInfo,
  };
};
