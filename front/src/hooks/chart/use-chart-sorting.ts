// チャートデータのソート処理を行うフック
// 共通科目を優先的に表示し、その後に科目名の順序でソート
// useMemoを使用してソート結果をメモ化し、不要な再計算を防止
import { useMemo } from "react";
import type { DisplaySubjectScore } from "@/types/score";
import { sortByCommonSubject } from "@/utils/chart-utils";

export const useChartSorting = (
  data: DisplaySubjectScore[]
): DisplaySubjectScore[] => {
  return useMemo(() => sortByCommonSubject(data), [data]);
};
