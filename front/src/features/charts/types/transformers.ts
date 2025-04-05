/**
 * データ変換の型定義
 * チャートデータの変換処理に関する型定義を管理
 *
 * @module transformers
 * @description
 * - 変換後の科目データの型定義
 * - 基本的な変換パラメータの型定義
 * - 変換結果の型定義
 */

import { PieData, ChartError } from '@/types/pie-chart';

/**
 * 変換後の科目データの型
 */
export interface TransformedSubjectData {
  /** 科目の内部名 */
  name: string;
  /** 科目の表示名 */
  displayName: string;
  /** 科目のカテゴリ */
  category: string;
  /** テストタイプID */
  testTypeId: number;
  /** 科目の得点率（0-100%） */
  percentage: number;
  /** UI表示時の順序 */
  displayOrder: number;
}

/**
 * 基本的な変換パラメータの型
 */
export interface BaseTransformParams {
  /** 科目の得点 */
  value: number;
  /** 科目の総点 */
  totalScore: number;
  /** 科目の名称 */
  name: string;
  /** 関連するテストタイプのID */
  testTypeId: number;
  /** 科目の得点率（0-100%） */
  percentage: number;
  /** UI表示時の順序 */
  displayOrder: number;
}

/**
 * 変換結果の型
 */
export type TransformResult = {
  /** 変換後のチャートデータ */
  data: PieData;
  /** 変換処理中のエラー情報 */
  error?: ChartError;
};
