import { PieData } from "@/types/charts/pie-chart";

/**
 * 変換後の科目データの型
 */
export interface TransformedSubjectData {
  /** 科目の内部名 */
  name: string;
  /** 科目の表示名 */
  displayName: string;
  /** 科目のカテゴリー */
  category: string;
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
}

/**
 * 変換結果の型
 */
export type TransformResult = {
  /** 変換後のデータ */
  data: PieData;
  /** メタデータ */
  metadata?: {
    /** カテゴリー */
    category?: string;
    /** 表示名 */
    displayName?: string;
  };
};
