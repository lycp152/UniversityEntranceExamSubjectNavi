import { subjects } from "../../../SearchResultTable/SubjectData";
import { useCalculateScore } from "./useCalculateScore";
import { useDetailedData } from "./useDetailedData";
import { useOuterData } from "./useOuterData";

export const useChartData = (subjectData: (typeof subjects)[0]) => {
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
