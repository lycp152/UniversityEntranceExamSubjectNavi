import { EXAM_TYPES } from '@/constants/subjects';
import {
  isCommonSubject,
  isSecondarySubject,
  compareSubjectOrder,
} from '@/utils/validation/subject-type-validator';
import { extractSubjectMainCategory } from '@/utils/formatters/subject-name-display-formatter';
import type { DisplaySubjectScore } from '@/types/score';
import type { ChartResult, ChartError } from '@/types/charts/pie-chart';

// チャートのメタデータを生成する関数
// 処理時間、総アイテム数、成功数、エラー数などの情報を含む
export const createChartMetadata = <T>(
  startTime: number,
  totalItems: number,
  data: T[],
  errors: ChartError[]
) => ({
  processedAt: startTime,
  totalItems,
  successCount: data.length,
  errorCount: errors.length,
});

// 科目名からカテゴリタイプを取得する関数
// 共通テスト、二次試験、その他の科目を分類
export const getCategoryType = (name: string): string => {
  if (isCommonSubject(name)) return EXAM_TYPES.COMMON.name;
  if (isSecondarySubject(name)) return EXAM_TYPES.SECONDARY.name;
  return extractSubjectMainCategory(name);
};

// 科目チャートのソート順序を取得する関数
// 共通テスト（左）→ 共通テスト（右）→ 二次試験（左）→ 二次試験（右）の順でソート
export const getSubjectChartOrder = (name: string): number => {
  const isCommon = isCommonSubject(name);
  const isSecondary = isSecondarySubject(name);
  const isLeft = name.includes('L');
  const isRight = name.includes('R');

  if (isCommon && isLeft) return 0;
  if (isCommon && isRight) return 1;
  if (isSecondary && isLeft) return 2;
  if (isSecondary && isRight) return 3;
  return 999;
};

// 共通科目を優先的にソートする関数
// 共通テストを先頭に配置し、その後に科目名の順序でソート
export const sortByCommonSubject = (items: DisplaySubjectScore[]): DisplaySubjectScore[] => {
  return [...items].sort((a, b) => {
    const aIsCommon = isCommonSubject(a.name);
    const bIsCommon = isCommonSubject(b.name);
    if (aIsCommon !== bIsCommon) return aIsCommon ? -1 : 1;
    return compareSubjectOrder(a.name, b.name);
  });
};

// 科目チャートのデータを時計回りに並び替える関数
// 共通テストと二次試験の左右の順序に従ってソート
export const sortSubjectDetailedData = (data: DisplaySubjectScore[]): DisplaySubjectScore[] => {
  return [...data].sort((a, b) => getSubjectChartOrder(a.name) - getSubjectChartOrder(b.name));
};

// エラー結果を生成する関数
// エラー情報を含むチャート結果オブジェクトを生成
export const createChartErrorResult = <T>(errors: ChartError[]): ChartResult<T> => ({
  data: [],
  errors,
  hasErrors: errors.length > 0,
  status: errors.length > 0 ? 'error' : 'success',
});
