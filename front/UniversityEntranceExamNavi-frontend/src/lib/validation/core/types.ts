/**
 * バリデーションエラーの型定義
 */
export interface ValidationError {
  code: string;
  message: string;
  field?: string;
}

/**
 * バリデーション結果の型定義
 */
export interface ValidationResult<T = unknown> {
  isValid: boolean;
  data?: T;
  errors: ValidationError[];
  metadata?: ValidationMetadata;
}

/**
 * バリデーションのメタデータ
 */
export interface ValidationMetadata {
  readonly validatedAt: number;
  readonly rules: readonly string[];
  readonly failureDetails?: Record<string, unknown>;
}

/**
 * バリデーションルールの型定義
 */
export interface ValidationRule<T> {
  code: string;
  validate: (value: T) => boolean | Promise<boolean>;
  message: string;
  category?: string;
}

/**
 * バリデーションコンテキストの型定義
 */
export interface ValidationContext {
  maxValue?: number;
  minValue?: number;
  [key: string]: unknown;
}
