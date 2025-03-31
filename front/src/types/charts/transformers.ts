import { PieData, ChartError } from "@/types/charts/pie-chart";

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
  /** パーセンテージ */
  percentage: number;
  /** 表示順序 */
  displayOrder: number;
}

/**
 * 基本的な変換パラメータの型
 */
export interface BaseTransformParams {
  /** 点数 */
  value: number;
  /** 総点 */
  totalScore: number;
  /** 科目名 */
  name: string;
  /** テストタイプID */
  testTypeId: number;
  /** パーセンテージ */
  percentage: number;
  /** 表示順序 */
  displayOrder: number;
}

/**
 * 変換結果の型
 */
export type TransformResult = {
  /** 変換後のデータ */
  data: PieData;
  /** エラー情報 */
  error?: ChartError;
};
