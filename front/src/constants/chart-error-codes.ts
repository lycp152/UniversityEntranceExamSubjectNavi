import { ErrorSeverity } from "@/lib/api/errors/categories";

// チャート関連のエラーコード
export const CHART_ERROR_CODES = {
  // データ変換エラー
  TRANSFORM_ERROR: "TRANSFORM_ERROR",
  INVALID_DATA_FORMAT: "INVALID_DATA_FORMAT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",

  // 計算エラー
  CALCULATION_ERROR: "CALCULATION_ERROR",
  INVALID_PERCENTAGE: "INVALID_PERCENTAGE",
  TOTAL_EXCEEDED: "TOTAL_EXCEEDED",

  // 表示エラー
  RENDER_ERROR: "RENDER_ERROR",
  INVALID_DIMENSIONS: "INVALID_DIMENSIONS",
  OVERFLOW_ERROR: "OVERFLOW_ERROR",
} as const;

// エラーの重要度マッピング
export const CHART_ERROR_SEVERITY: Record<
  keyof typeof CHART_ERROR_CODES,
  ErrorSeverity
> = {
  TRANSFORM_ERROR: "error",
  INVALID_DATA_FORMAT: "error",
  MISSING_REQUIRED_FIELD: "error",
  CALCULATION_ERROR: "error",
  INVALID_PERCENTAGE: "error",
  TOTAL_EXCEEDED: "error",
  RENDER_ERROR: "warning",
  INVALID_DIMENSIONS: "warning",
  OVERFLOW_ERROR: "warning",
};

// エラーメッセージの定義
export const CHART_ERROR_MESSAGES: Record<
  keyof typeof CHART_ERROR_CODES,
  string
> = {
  TRANSFORM_ERROR: "データの変換中にエラーが発生しました",
  INVALID_DATA_FORMAT: "データの形式が不正です",
  MISSING_REQUIRED_FIELD: "必須フィールドが不足しています",
  CALCULATION_ERROR: "計算中にエラーが発生しました",
  INVALID_PERCENTAGE: "パーセンテージの値が不正です（0-100の範囲）",
  TOTAL_EXCEEDED: "合計値が上限を超えています",
  RENDER_ERROR: "チャートの描画中にエラーが発生しました",
  INVALID_DIMENSIONS: "チャートのサイズが不正です",
  OVERFLOW_ERROR: "データが表示可能な範囲を超えています",
};

// 型定義のエクスポート
export type ChartErrorCode = keyof typeof CHART_ERROR_CODES;
export type ChartErrorMessage = (typeof CHART_ERROR_MESSAGES)[ChartErrorCode];
export type ChartErrorSeverity = (typeof CHART_ERROR_SEVERITY)[ChartErrorCode];
