import type { DisplaySubjectScore } from "@/types/score";
import {
  isCommonSubject,
  compareSubjectOrder,
} from "@/utils/validation/subject-type-validator";

export const useChartSorting = (
  data: DisplaySubjectScore[]
): DisplaySubjectScore[] => {
  return [...data].sort((a, b) => {
    const aIsCommon = isCommonSubject(a.name);
    const bIsCommon = isCommonSubject(b.name);
    if (aIsCommon !== bIsCommon) return aIsCommon ? -1 : 1;
    return compareSubjectOrder(a.name, b.name);
  });
};
