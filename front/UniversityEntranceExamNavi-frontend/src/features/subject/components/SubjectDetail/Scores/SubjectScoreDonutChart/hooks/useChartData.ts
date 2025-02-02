import { Subject } from '@/features/data/types';
import { useCalculateScore } from './useCalculateScore';
import { useDetailedData } from './useDetailedData';
import { useOuterData } from './useOuterData';

export const useChartData = (subjectData: Subject) => {
  const { totalScore, getCategoryTotal } = useCalculateScore(subjectData);
  const detailedResult = useDetailedData(subjectData, totalScore);
  const outerData = useOuterData(subjectData, totalScore, getCategoryTotal);

  return {
    detailedData: detailedResult.data,
    outerData,
    errors: detailedResult.errors,
  };
};
