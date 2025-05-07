/**
 * チャートデータの変換を行うモジュール
 * 科目データを円グラフ用のデータ形式に変換し、詳細情報と集計情報を生成
 */

import { DetailedPieData, PieData } from '@/types/pie-chart';
import { BaseTransformParams } from '@/features/charts/types/transformers';
import { EXAM_TYPES, ExamType } from '@/constants/constraint/exam-types';
import { transformSubjectData } from '@/features/charts/utils/formatters/subject-data-formatter';
import { transformToPieData } from '@/features/charts/utils/calculations/pie-data-transformer';

/**
 * テストタイプを科目タイプに変換する関数
 *
 * @param {TestType} testType - テストタイプ（共通テストまたは二次試験）
 * @returns {typeof EXAM_TYPES[keyof typeof EXAM_TYPES]} 対応する科目タイプ
 */
const mapTestTypeToSubjectType = (testType: ExamType) =>
  testType === EXAM_TYPES.COMMON.name ? EXAM_TYPES.COMMON : EXAM_TYPES.SECONDARY;

/**
 * 詳細な円グラフデータを生成する関数
 * 科目ごとのスコア情報を円グラフ用のデータ形式に変換
 *
 * @param {string} subjectName - 科目名
 * @param {number} value - 科目のスコア
 * @param {number} totalScore - 合計スコア
 * @param {TestType} testType - テストタイプ
 * @returns {DetailedPieData} 詳細な円グラフデータ
 */
export const createDetailedPieData = (
  subjectName: string,
  value: number,
  totalScore: number,
  testType: ExamType
): DetailedPieData => {
  const { name, displayName, category } = transformSubjectData(subjectName, testType);
  const transformInput: BaseTransformParams = {
    value,
    totalScore,
    name,
    testTypeId: 0,
    percentage: 0,
    displayOrder: 0,
  };
  const baseData = transformToPieData(transformInput);

  return {
    ...baseData.data,
    category,
    displayName,
    type: mapTestTypeToSubjectType(testType).name,
    testTypeId: mapTestTypeToSubjectType(testType).id,
    displayOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    createdBy: 'system',
    updatedBy: 'system',
  };
};

/**
 * 集計用の円グラフデータを生成する関数
 * カテゴリーごとの合計スコアを円グラフ用のデータ形式に変換
 *
 * @param {string} category - カテゴリー名
 * @param {number} total - カテゴリーの合計スコア
 * @param {number} totalScore - 全体の合計スコア
 * @returns {PieData} 集計用の円グラフデータ
 */
export const createOuterPieData = (category: string, total: number, totalScore: number): PieData =>
  transformToPieData({
    value: total,
    totalScore,
    name: category,
    testTypeId: 0,
    percentage: 0,
    displayOrder: 0,
  }).data;
