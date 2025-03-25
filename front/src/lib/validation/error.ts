import { ValidationCategory, ValidationSeverity } from "@/types/validation";

/**
 * バリデーションエラーの詳細情報
 */
export interface ValidationErrorDetail {
  /** エラーメッセージ */
  message: string;
  /** エラーのカテゴリー */
  category: ValidationCategory;
  /** エラーの重要度 */
  severity: ValidationSeverity;
  /** エラーが発生したフィールド */
  field?: string;
  /** エラーが発生した値 */
  value?: unknown;
}

/**
 * バリデーションエラークラス
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly details: ValidationErrorDetail[]
  ) {
    super(message);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * エラー詳細の取得
   */
  get errors(): ValidationErrorDetail[] {
    return this.details;
  }

  /**
   * 指定された重要度以上のエラーの存在確認
   */
  hasErrors(severity: ValidationSeverity = ValidationSeverity.ERROR): boolean {
    return this.details.some((detail) => detail.severity === severity);
  }

  /**
   * カテゴリー別のエラー取得
   */
  getErrorsByCategory(category: ValidationCategory): ValidationErrorDetail[] {
    return this.details.filter((detail) => detail.category === category);
  }

  /**
   * 重要度別のエラー取得
   */
  getErrorsBySeverity(severity: ValidationSeverity): ValidationErrorDetail[] {
    return this.details.filter((detail) => detail.severity === severity);
  }

  /**
   * JSON形式への変換
   */
  toJSON(): { message: string; details: ValidationErrorDetail[] } {
    return {
      message: this.message,
      details: this.details,
    };
  }
}
