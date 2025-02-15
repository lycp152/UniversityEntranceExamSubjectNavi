import type { Subject } from '@/lib/types';
import { useCalculateScore } from './useCalculateScore';
import { useDetailedData } from './useDetailedData';
import { useOuterData } from './useOuterData';

export const useChartData = (subjectData: Subject) => {
  const { totalScore, calculateCategoryTotal } = useCalculateScore(subjectData);
  const detailedResult = useDetailedData(subjectData, totalScore);
  const outerData = useOuterData(subjectData, totalScore, calculateCategoryTotal);

  return {
    detailedData: detailedResult.data,
    outerData,
    errors: detailedResult.errors,
  };
};
