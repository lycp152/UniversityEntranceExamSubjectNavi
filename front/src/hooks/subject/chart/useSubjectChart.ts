import { Subject } from "@/lib/types/subject/subject";
import { SubjectScore } from "@/types/subject/score";
import { useChartData } from "@/features/charts/subject/donut/hooks/useChartData";
import { SUBJECT_TYPES } from "@/lib/constants/subject";
import {
  isCommonSubject,
  compareSubjectOrder,
  isSecondarySubject,
} from "@/utils/subject/operations/subjectOperations";
import { calculatePercentage } from "@/utils/subject/score/scoreCalculations";

// チャート用の合計点計算
const calculateChartTotalScore = (data: SubjectScore[]): number => {
  return data.reduce((sum: number, item: SubjectScore) => sum + item.value, 0);
};

// 左側グラフのデータを時計回りに並び替える
const sortLeftDetailedData = (detailedData: SubjectScore[]): SubjectScore[] => {
  // デバッグ用のログ
  console.log("Input data for sorting:", detailedData);

  const getOrder = (name: string): number => {
    if (name.includes("L") && name.includes("共通")) return 0; // 左上
    if (name.includes("R") && name.includes("共通")) return 1; // 右上
    if (name.includes("L") && name.includes("二次")) return 2; // 右下
    if (name.includes("R") && name.includes("二次")) return 3; // 左下
    return 999; // その他
  };

  const sorted = [...detailedData].sort((a, b) => {
    const aOrder = getOrder(a.name);
    const bOrder = getOrder(b.name);

    // デバッグ用のログ
    console.log("Comparing:", {
      aName: a.name,
      bName: b.name,
      aOrder,
      bOrder,
    });

    return aOrder - bOrder;
  });

  // デバッグ用のログ
  console.log("Sorted result:", sorted);

  return sorted;
};

const createRightOuterData = (detailedData: SubjectScore[]): SubjectScore[] => {
  const totalScore = calculateChartTotalScore(detailedData);

  return detailedData
    .reduce((acc: SubjectScore[], current: SubjectScore) => {
      const type = current.name.includes(SUBJECT_TYPES.COMMON)
        ? SUBJECT_TYPES.COMMON
        : SUBJECT_TYPES.SECONDARY;
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

const createRightDetailedData = (
  detailedData: SubjectScore[]
): SubjectScore[] => {
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

  // デバッグ用のログ
  console.log("Original detailedData:", detailedData);

  const rightChartData = {
    detailedData: createRightDetailedData(detailedData),
    outerData: createRightOuterData(detailedData),
  };

  return {
    leftChart: {
      detailedData: sortLeftDetailedData(detailedData),
      outerData,
    },
    rightChart: rightChartData,
  };
};
