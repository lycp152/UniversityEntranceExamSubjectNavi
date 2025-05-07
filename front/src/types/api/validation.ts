/**
 * バリデーション関連の型定義
 * バリデーション処理に必要な型やインターフェースを定義
 *
 * @module validation-types
 * @description
 * - バリデーションエラーの型定義
 * - バリデーション結果の型定義
 * - バリデーションルールの型定義
 * - バリデーションコンテキストの型定義
 */

import {
  ValidationCategory,
  ValidationErrorCode,
  ValidationSeverity,
} from '@/constants/validation-constants';

/**
 * バリデーションエラーを表すインターフェース
 *
 * @interface ValidationError
 * @property {string} field - エラーが発生したフィールド名
 * @property {string} message - エラーメッセージ
 * @property {ValidationErrorCode} code - エラーコード
 * @property {ValidationSeverity} severity - エラーの重要度
 * @property {Record<string, unknown>} [metadata] - 追加のメタデータ
 * @property {ValidationCategory} [category] - バリデーションカテゴリー
 * @property {unknown} [value] - エラーが発生した値
 */
export interface ValidationError {
  field: string;
  message: string;
  code: ValidationErrorCode;
  severity: ValidationSeverity;
  metadata?: Record<string, unknown>;
  category?: ValidationCategory;
  value?: unknown;
}

/**
 * バリデーション結果を表すインターフェース
 *
 * @interface ValidationResult
 * @template T - バリデーション対象のデータ型
 * @property {boolean} isValid - バリデーションが成功したかどうか
 * @property {ValidationError[]} errors - バリデーションエラーの配列
 * @property {ValidationMetadata} [metadata] - バリデーションのメタデータ
 * @property {T} [data] - バリデーション済みのデータ
 */
export interface ValidationResult<T = unknown> {
  isValid: boolean;
  errors: ValidationError[];
  metadata?: ValidationMetadata;
  data?: T;
}

/**
 * バリデーション関数の型定義
 *
 * @type {Function} Validator
 * @template T - バリデーション対象のデータ型
 * @param {unknown} data - バリデーション対象のデータ
 * @returns {ValidationResult<T>} バリデーション結果
 */
export type Validator<T> = (data: unknown) => ValidationResult<T>;

/**
 * バリデーションコンテキストを表すインターフェース
 *
 * @interface ValidationContext
 * @property {string} fieldName - バリデーション対象のフィールド名
 * @property {unknown} value - バリデーション対象の値
 * @property {number} timestamp - バリデーション実行時のタイムスタンプ
 * @property {Record<string, unknown>} [key: string] - 追加のコンテキスト情報
 */
export interface ValidationContext {
  fieldName: string;
  value: unknown;
  timestamp: number;
  [key: string]: unknown;
}

/**
 * バリデーションルールを表す型定義
 *
 * @type {Object} ValidationRule
 * @template T - バリデーション対象のデータ型
 * @property {string} field - バリデーション対象のフィールド名
 * @property {(value: T) => boolean} condition - バリデーション条件
 * @property {string} message - エラーメッセージ
 * @property {ValidationErrorCode} code - エラーコード
 * @property {ValidationSeverity} severity - 重要度
 * @property {ValidationCategory} category - カテゴリー
 * @property {Record<string, unknown>} [metadata] - 追加のメタデータ
 */
export type ValidationRule<T> = {
  field: string;
  condition: (value: T) => boolean;
  message: string;
  code: ValidationErrorCode;
  severity: ValidationSeverity;
  category: ValidationCategory;
  metadata?: Record<string, unknown>;
};

/**
 * バリデーションのメタデータを表すインターフェース
 *
 * @interface ValidationMetadata
 * @property {number} validatedAt - バリデーション実行時のタイムスタンプ
 * @property {string[]} [rules] - 適用されたバリデーションルール
 * @property {number} [processedAt] - 処理完了時のタイムスタンプ
 * @property {number} [totalItems] - 処理対象の総数
 * @property {number} [successCount] - 成功したバリデーション数
 * @property {number} [errorCount] - エラーが発生したバリデーション数
 * @property {number} [duration] - 処理にかかった時間（ミリ秒）
 * @property {string[]} [validationRules] - 適用されたバリデーションルール
 * @property {Object} [performance] - パフォーマンス情報
 */
export interface ValidationMetadata {
  validatedAt: number;
  rules?: string[];
  processedAt?: number;
  totalItems?: number;
  successCount?: number;
  errorCount?: number;
  duration?: number;
  validationRules?: string[];
  performance?: {
    validationDuration: number;
    ruleExecutionTimes: Record<string, number>;
  };
}

/**
 * スコアバリデーションルールを表す型定義
 *
 * @type {Object} ScoreValidationRules
 * @property {ValidationRule<number>[]} commonTest - 共通テストのバリデーションルール
 * @property {ValidationRule<number>[]} secondTest - 二次試験のバリデーションルール
 * @property {ValidationRule<number>[]} total - 合計点のバリデーションルール
 * @property {number} [min] - 最小値
 * @property {number} [max] - 最大値
 * @property {boolean} [isInteger] - 整数値かどうか
 * @property {ValidationRule<number>[]} [customRules] - カスタムバリデーションルール
 * @property {Record<string, unknown>} [metadata] - 追加のメタデータ
 */
export type ScoreValidationRules = {
  commonTest: ValidationRule<number>[];
  secondTest: ValidationRule<number>[];
  total: ValidationRule<number>[];
  min?: number;
  max?: number;
  isInteger?: boolean;
  customRules?: ValidationRule<number>[];
  metadata?: Record<string, unknown>;
};
