import type { UISubject } from "@/types/universities/subjects";
import type { DisplaySubjectScore } from "@/types/score";
import { useChartData } from "@/hooks/use-chart-data";
import { EXAM_TYPES } from "@/constants/subjects";
import {
  isCommonSubject,
  isSecondarySubject,
} from "@/utils/validation/subject-type-validator";
import { calculatePercentage } from "@/utils/math/percentage";

// チャート用の合計点計算
const calculateChartTotalScore = (data: DisplaySubjectScore[]): number => {
  return data.reduce((sum, item) => sum + item.value, 0);
};

// 左側グラフのデータを時計回りに並び替える
const sortLeftDetailedData = (
  detailedData: DisplaySubjectScore[]
): DisplaySubjectScore[] => {
  const getOrder = (name: string): number => {
    if (name.includes("L") && name.includes("共通")) return 0;
    if (name.includes("R") && name.includes("共通")) return 1;
    if (name.includes("L") && name.includes("二次")) return 2;
    if (name.includes("R") && name.includes("二次")) return 3;
    return 999;
  };

  return [...detailedData].sort((a, b) => getOrder(a.name) - getOrder(b.name));
};

const sortByExamType = (
  a: DisplaySubjectScore,
  b: DisplaySubjectScore
): number => {
  if (a.name === EXAM_TYPES.COMMON) return -1;
  if (b.name === EXAM_TYPES.COMMON) return 1;
  return 0;
};

const createRightOuterData = (
  detailedData: DisplaySubjectScore[]
): DisplaySubjectScore[] => {
  const totalScore = calculateChartTotalScore(detailedData);

  return detailedData
    .reduce<DisplaySubjectScore[]>((acc, current) => {
      const type = current.name.includes(EXAM_TYPES.COMMON)
        ? EXAM_TYPES.COMMON
        : EXAM_TYPES.SECONDARY;
      const existingItem = acc.find((item) => item.name === type);

      if (existingItem) {
        existingItem.value += current.value;
        existingItem.percentage = calculatePercentage(
          existingItem.value,
          totalScore
        );
      } else {
        acc.push({
          name: type,
          value: current.value,
          category: type,
          percentage: calculatePercentage(current.value, totalScore),
        });
      }

      return acc;
    }, [])
    .sort(sortByExamType);
};

const getCategoryType = (item: DisplaySubjectScore): string => {
  if (isCommonSubject(item.name)) return EXAM_TYPES.COMMON;
  if (isSecondarySubject(item.name)) return EXAM_TYPES.SECONDARY;
  return item.category;
};

const createRightDetailedData = (
  detailedData: DisplaySubjectScore[]
): DisplaySubjectScore[] => {
  const mappedData = [...detailedData].map((item) => ({
    ...item,
    category: getCategoryType(item),
  }));
  return [...mappedData].sort((a, b) => {
    const aIsCommon = isCommonSubject(a.name);
    const bIsCommon = isCommonSubject(b.name);
    if (aIsCommon !== bIsCommon) return aIsCommon ? -1 : 1;
    if (aIsCommon === bIsCommon) return 0;
    return aIsCommon ? -1 : 1;
  });
};

type SubjectChartData = {
  leftChart: {
    detailedData: DisplaySubjectScore[];
    outerData: DisplaySubjectScore[];
  };
  rightChart: {
    detailedData: DisplaySubjectScore[];
    outerData: DisplaySubjectScore[];
  };
};

export const useSubjectChart = (subjectData: UISubject): SubjectChartData => {
  const chartData = useChartData(subjectData);

  const rightChartData = {
    detailedData: createRightDetailedData(chartData.detailedData),
    outerData: createRightOuterData(chartData.detailedData),
  };

  return {
    leftChart: {
      detailedData: sortLeftDetailedData(chartData.detailedData),
      outerData: chartData.outerData.map((item) => ({
        ...item,
        category: item.name.includes(EXAM_TYPES.COMMON)
          ? EXAM_TYPES.COMMON
          : EXAM_TYPES.SECONDARY,
      })),
    },
    rightChart: rightChartData,
  };
};
