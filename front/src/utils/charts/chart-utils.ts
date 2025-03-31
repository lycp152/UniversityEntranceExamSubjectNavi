/**
 * チャート関連のユーティリティ関数
 * チャートのデータ処理や表示に関する補助関数を提供
 *
 * @module chart-utils
 * @description
 * - チャートメタデータの生成
 * - 科目カテゴリの分類
 * - チャートデータのソート処理
 * - エラー結果の生成
 */

import { EXAM_TYPES } from '@/constants/subjects';
import {
  isCommonSubject,
  isSecondarySubject,
  compareSubjectOrder,
} from '@/utils/validation/subject-type-validator';
import { extractSubjectMainCategory } from '@/utils/formatters/subject-name-display-formatter';
import type { DisplaySubjectScore } from '@/types/score';
import type { ChartResult, ChartError } from '@/types/charts/pie-chart';

/**
 * チャートのメタデータを生成
 * @param startTime - 処理開始時間
 * @param totalItems - 総アイテム数
 * @param data - 処理済みデータ
 * @param errors - エラー情報
 * @returns チャートのメタデータ
 */
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

/**
 * 科目名からカテゴリタイプを取得
 * @param name - 科目名
 * @returns カテゴリタイプ
 */
export const getCategoryType = (name: string): string => {
  if (isCommonSubject(name)) return EXAM_TYPES.COMMON.name;
  if (isSecondarySubject(name)) return EXAM_TYPES.SECONDARY.name;
  return extractSubjectMainCategory(name);
};

/**
 * 科目チャートのソート順序を取得
 * @param name - 科目名
 * @returns ソート順序の数値
 */
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

/**
 * 共通科目を優先的にソート
 * @param items - 科目スコアの配列
 * @returns ソート済みの科目スコア配列
 */
export const sortByCommonSubject = (items: DisplaySubjectScore[]): DisplaySubjectScore[] => {
  return [...items].sort((a, b) => {
    const aIsCommon = isCommonSubject(a.name);
    const bIsCommon = isCommonSubject(b.name);
    if (aIsCommon !== bIsCommon) return aIsCommon ? -1 : 1;
    return compareSubjectOrder(a.name, b.name);
  });
};

/**
 * 科目チャートのデータを時計回りに並び替え
 * @param data - 科目スコアの配列
 * @returns ソート済みの科目スコア配列
 */
export const sortSubjectDetailedData = (data: DisplaySubjectScore[]): DisplaySubjectScore[] => {
  return [...data].sort((a, b) => getSubjectChartOrder(a.name) - getSubjectChartOrder(b.name));
};

/**
 * エラー結果を生成
 * @param errors - エラー情報の配列
 * @returns エラー結果オブジェクト
 */
export const createChartErrorResult = <T>(errors: ChartError[]): ChartResult<T> => ({
  data: [],
  errors,
  hasErrors: errors.length > 0,
  status: errors.length > 0 ? 'error' : 'success',
});
