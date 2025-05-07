/**
 * バリデーション関連の定数定義
 * バリデーションの重要度、カテゴリー、エラーコードなどを定義
 *
 * @module validation-constants
 * @description
 * - バリデーションの重要度レベル
 * - バリデーションのカテゴリー分類
 * - エラーコードの定義
 * - バリデーションルールの作成ヘルパー
 */

import { ValidationRule } from '@/types/api/validation';

/**
 * バリデーションの重要度を表す列挙型
 *
 * @enum {string} ValidationSeverity
 * @property {string} ERROR - エラー：処理を中断する重大な問題
 * @property {string} WARNING - 警告：処理は継続可能な問題
 * @property {string} INFO - 情報：参考情報としての通知
 */
export const enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

/**
 * バリデーションのカテゴリーを表す列挙型
 *
 * @enum {string} ValidationCategory
 * @property {string} TRANSFORM - データ変換：データ形式の変換に関する検証
 * @property {string} FORMAT - 形式：データの形式に関する検証
 * @property {string} REQUIRED - 必須：必須項目の検証
 * @property {string} CALCULATION - 計算：計算結果の検証
 * @property {string} RENDER - 表示：表示に関する検証
 */
export const enum ValidationCategory {
  TRANSFORM = 'transform',
  FORMAT = 'format',
  REQUIRED = 'required',
  CALCULATION = 'calculation',
  RENDER = 'render',
}

/**
 * バリデーションエラーコードを表す列挙型
 *
 * @enum {string} ValidationErrorCode
 * @property {string} TRANSFORM_ERROR - データ変換エラー
 * @property {string} INVALID_DATA_FORMAT - データ形式が無効
 * @property {string} MISSING_REQUIRED_FIELD - 必須項目が未入力
 * @property {string} CALCULATION_ERROR - 計算エラー
 * @property {string} INVALID_PERCENTAGE - パーセンテージが無効
 * @property {string} TOTAL_EXCEEDED - 合計値が超過
 * @property {string} RENDER_ERROR - 表示エラー
 * @property {string} INVALID_DIMENSIONS - 寸法が無効
 * @property {string} OVERFLOW_ERROR - オーバーフローエラー
 */
export const enum ValidationErrorCode {
  // データ変換エラー
  TRANSFORM_ERROR = 'TRANSFORM_ERROR',
  INVALID_DATA_FORMAT = 'INVALID_DATA_FORMAT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // 計算エラー
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  INVALID_PERCENTAGE = 'INVALID_PERCENTAGE',
  TOTAL_EXCEEDED = 'TOTAL_EXCEEDED',

  // 表示エラー
  RENDER_ERROR = 'RENDER_ERROR',
  INVALID_DIMENSIONS = 'INVALID_DIMENSIONS',
  OVERFLOW_ERROR = 'OVERFLOW_ERROR',
}

/**
 * バリデーションルールを作成するヘルパー関数
 *
 * @template T - バリデーション対象のデータ型
 * @param {string} field - バリデーション対象のフィールド名
 * @param {(value: T) => boolean} condition - バリデーション条件
 * @param {string} message - エラーメッセージ
 * @param {ValidationErrorCode} code - エラーコード
 * @param {ValidationSeverity} [severity=ValidationSeverity.ERROR] - 重要度
 * @param {ValidationCategory} [category=ValidationCategory.TRANSFORM] - カテゴリー
 * @returns {ValidationRule<T>} 作成されたバリデーションルール
 */
export const createValidationRule = <T>(
  field: string,
  condition: (value: T) => boolean,
  message: string,
  code: ValidationErrorCode,
  severity: ValidationSeverity = ValidationSeverity.ERROR,
  category: ValidationCategory = ValidationCategory.TRANSFORM
): ValidationRule<T> => ({
  field,
  condition,
  message,
  code,
  severity,
  category,
});

/**
 * バリデーションのデフォルト設定
 */
export const ValidationDefaults = {
  severity: ValidationSeverity.ERROR,
  category: ValidationCategory.TRANSFORM,
} as const;

/**
 * バリデーションのエラーメッセージ
 */
export const ValidationMessages = {
  [ValidationErrorCode.TRANSFORM_ERROR]: 'データの変換に失敗しました',
  [ValidationErrorCode.INVALID_DATA_FORMAT]: 'データの形式が無効です',
  [ValidationErrorCode.MISSING_REQUIRED_FIELD]: '必須項目が未入力です',
  [ValidationErrorCode.CALCULATION_ERROR]: '計算エラーが発生しました',
  [ValidationErrorCode.INVALID_PERCENTAGE]: 'パーセンテージの値が無効です',
  [ValidationErrorCode.TOTAL_EXCEEDED]: '合計値が上限を超えています',
  [ValidationErrorCode.RENDER_ERROR]: '表示エラーが発生しました',
  [ValidationErrorCode.INVALID_DIMENSIONS]: '寸法の値が無効です',
  [ValidationErrorCode.OVERFLOW_ERROR]: 'オーバーフローエラーが発生しました',
} as const;
