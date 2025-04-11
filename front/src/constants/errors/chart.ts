import { ErrorSeverity } from '@/types/error/categories';

/**
 * チャート関連のエラーコード定義
 * グラフの描画やデータ処理に関するエラーを定義します
 */
export const CHART_ERROR_CODES = {
  /** データ変換エラー */
  TRANSFORM_ERROR: 'TRANSFORM_ERROR',
  /** データ形式が不正 */
  INVALID_DATA_FORMAT: 'INVALID_DATA_FORMAT',
  /** 必須フィールドの欠落 */
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  /** 計算エラー */
  CALCULATION_ERROR: 'CALCULATION_ERROR',
  /** パーセンテージ値が不正（0-100の範囲） */
  INVALID_PERCENTAGE: 'INVALID_PERCENTAGE',
  /** 合計値が上限を超過 */
  TOTAL_EXCEEDED: 'TOTAL_EXCEEDED',

  /** 表示エラー */
  RENDER_ERROR: 'RENDER_ERROR',
  /** チャートの寸法が不正 */
  INVALID_DIMENSIONS: 'INVALID_DIMENSIONS',
  /** データが表示範囲を超過 */
  OVERFLOW_ERROR: 'OVERFLOW_ERROR',
} as const;

/** チャートエラーコードの型定義 */
export type ChartErrorCode = keyof typeof CHART_ERROR_CODES;

/**
 * エラーの重要度マッピング
 * 各エラーコードに対応する重要度（error/warning）を定義
 */
export const CHART_ERROR_SEVERITY: Record<keyof typeof CHART_ERROR_CODES, ErrorSeverity> = {
  TRANSFORM_ERROR: 'error',
  INVALID_DATA_FORMAT: 'error',
  MISSING_REQUIRED_FIELD: 'error',
  CALCULATION_ERROR: 'error',
  INVALID_PERCENTAGE: 'error',
  TOTAL_EXCEEDED: 'error',
  RENDER_ERROR: 'warning',
  INVALID_DIMENSIONS: 'warning',
  OVERFLOW_ERROR: 'warning',
};

/** チャートエラーの重要度の型定義 */
export type ChartErrorSeverity = (typeof CHART_ERROR_SEVERITY)[ChartErrorCode];

/**
 * エラーメッセージの定義
 * 各エラーコードに対応するユーザーフレンドリーなメッセージを定義
 */
export const CHART_ERROR_MESSAGES: Record<keyof typeof CHART_ERROR_CODES, string> = {
  TRANSFORM_ERROR: 'データの変換中にエラーが発生しました',
  INVALID_DATA_FORMAT: 'データの形式が不正です',
  MISSING_REQUIRED_FIELD: '必須フィールドが不足しています',
  CALCULATION_ERROR: '計算中にエラーが発生しました',
  INVALID_PERCENTAGE: 'パーセンテージの値が不正です（0-100の範囲）',
  TOTAL_EXCEEDED: '合計値が上限を超えています',
  RENDER_ERROR: 'チャートの描画中にエラーが発生しました',
  INVALID_DIMENSIONS: 'チャートのサイズが不正です',
  OVERFLOW_ERROR: 'データが表示可能な範囲を超えています',
};

/** チャートエラーメッセージの型定義 */
export type ChartErrorMessage = (typeof CHART_ERROR_MESSAGES)[ChartErrorCode];
