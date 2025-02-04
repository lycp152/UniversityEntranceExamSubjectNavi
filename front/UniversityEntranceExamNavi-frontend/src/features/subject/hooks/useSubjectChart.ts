import { Subject } from '@/lib/types';
import { SubjectScore } from '../types';
import { useChartData } from '../components/SubjectDetail/Scores/SubjectScoreDonutChart/hooks/useChartData';
import { SUBJECT_TYPES } from '../constants';
import {
  isCommonSubject,
  compareSubjectOrder,
  isSecondarySubject,
} from '../utils/subjectOperations';

const calculateTotalScore = (data: SubjectScore[]): number => {
  return data.reduce((sum: number, item: SubjectScore) => sum + item.value, 0);
};

const createRightOuterData = (detailedData: SubjectScore[]): SubjectScore[] => {
  const totalScore = calculateTotalScore(detailedData);

  return detailedData
    .reduce((acc: SubjectScore[], current: SubjectScore) => {
      const type = current.name.includes(SUBJECT_TYPES.COMMON)
        ? SUBJECT_TYPES.COMMON
        : SUBJECT_TYPES.SECONDARY;
      const existingItem = acc.find((item) => item.name === type);

      if (existingItem) {
        existingItem.value += current.value;
        existingItem.percentage = (existingItem.value / totalScore) * 100;
      } else {
        acc.push({
          name: type,
          value: current.value,
          category: type,
          percentage: (current.value / totalScore) * 100,
        });
      }

      return acc;
    }, [])
    .sort((a: SubjectScore, b: SubjectScore) => {
      if (a.name === SUBJECT_TYPES.COMMON) return -1;
      if (b.name === SUBJECT_TYPES.COMMON) return 1;
      return 0;
    });
};

const getCategoryType = (item: SubjectScore) => {
  if (isCommonSubject(item.name)) {
    return SUBJECT_TYPES.COMMON;
  }
  if (isSecondarySubject(item.name)) {
    return SUBJECT_TYPES.SECONDARY;
  }
  return item.category;
};

const createRightDetailedData = (detailedData: SubjectScore[]): SubjectScore[] => {
  return [...detailedData]
    .map((item) => ({
      ...item,
      category: getCategoryType(item),
    }))
    .sort((a, b) => {
      const aIsCommon = isCommonSubject(a.name);
      const bIsCommon = isCommonSubject(b.name);

      if (aIsCommon !== bIsCommon) {
        return aIsCommon ? -1 : 1;
      }

      return compareSubjectOrder(a.name, b.name);
    });
};

export const useSubjectChart = (subjectData: Subject) => {
  const chartData = useChartData(subjectData);
  const { detailedData, outerData } = chartData as unknown as {
    detailedData: SubjectScore[];
    outerData: SubjectScore[];
  };

  const rightChartData = {
    detailedData: createRightDetailedData(detailedData),
    outerData: createRightOuterData(detailedData),
  };

  return {
    leftChart: {
      detailedData,
      outerData,
    },
    rightChart: rightChartData,
  };
};
