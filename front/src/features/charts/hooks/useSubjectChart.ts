import { UISubject } from "@/types/ui/subjects";
import { DisplaySubjectScore } from "@/types/score/score";
import { useChartData } from "@/features/charts/subject/donut/hooks/useChartData";
import { SUBJECT_TYPES } from "@/features/subjects/constants";
import {
  isCommonSubject,
  compareSubjectOrder,
  isSecondarySubject,
} from "@/features/charts/utils/operations/subjectOperations";
import { calculatePercentage } from "@/utils/math/percentage";

// チャート用の合計点計算
const calculateChartTotalScore = (data: DisplaySubjectScore[]): number => {
  return data.reduce(
    (sum: number, item: DisplaySubjectScore) => sum + item.value,
    0
  );
};

// 左側グラフのデータを時計回りに並び替える
const sortLeftDetailedData = (
  detailedData: DisplaySubjectScore[]
): DisplaySubjectScore[] => {
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

const createRightOuterData = (
  detailedData: DisplaySubjectScore[]
): DisplaySubjectScore[] => {
  const totalScore = calculateChartTotalScore(detailedData);

  return detailedData
    .reduce((acc: DisplaySubjectScore[], current: DisplaySubjectScore) => {
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
    .sort((a: DisplaySubjectScore, b: DisplaySubjectScore) => {
      if (a.name === SUBJECT_TYPES.COMMON) return -1;
      if (b.name === SUBJECT_TYPES.COMMON) return 1;
      return 0;
    });
};

const getCategoryType = (item: DisplaySubjectScore) => {
  if (isCommonSubject(item.name)) {
    return SUBJECT_TYPES.COMMON;
  }
  if (isSecondarySubject(item.name)) {
    return SUBJECT_TYPES.SECONDARY;
  }
  return item.category;
};

const createRightDetailedData = (
  detailedData: DisplaySubjectScore[]
): DisplaySubjectScore[] => {
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

export const useSubjectChart = (subjectData: UISubject) => {
  const chartData = useChartData(subjectData);
  const { detailedData, outerData } = chartData as unknown as {
    detailedData: DisplaySubjectScore[];
    outerData: DisplaySubjectScore[];
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
