/**
 * バリデーションルールの型定義
 */
export interface ValidationRule<T> {
  code: string;
  validate: (data: T) => boolean | Promise<boolean>;
  message: string;
}

/**
 * バリデーションコンテキストの型定義
 */
export interface ValidationContext {
  [key: string]: unknown;
}

/**
 * バリデーションメタデータの型定義
 */
export interface ValidationMetadata {
  validatedAt: number;
  rules?: string[];
  failureDetails?: Record<string, unknown>;
}

/**
 * バリデーション結果の型定義
 */
export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: Array<{
    code: string;
    message: string;
    field?: string;
    severity: "error" | "warning" | "info";
  }>;
  metadata?: ValidationMetadata;
}
