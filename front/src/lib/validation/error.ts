import { ValidationCategory, ValidationSeverity } from "@/types/validation";

/**
 * バリデーションエラーの詳細情報を表すインターフェース
 * エラーの具体的な内容、重要度、発生箇所などの情報を含む
 */
export interface ValidationErrorDetail {
  /** エラーの説明メッセージ */
  message: string;
  /** エラーの分類（例：フォーマット、必須項目、ビジネスルールなど） */
  category: ValidationCategory;
  /** エラーの重要度（error, warning, info） */
  severity: ValidationSeverity;
  /** エラーが発生したフォームフィールドやデータ項目の名前 */
  field?: string;
  /** エラーが発生した際の実際の値 */
  value?: unknown;
}

/**
 * バリデーションエラーを表すカスタムエラークラス
 * 複数のバリデーションエラー詳細を管理し、エラー情報の取得や操作を提供
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
   * エラー詳細の配列を取得
   * @returns バリデーションエラーの詳細情報の配列
   */
  get errors(): ValidationErrorDetail[] {
    return this.details;
  }

  /**
   * 指定された重要度以上のエラーが存在するか確認
   * @param severity - チェックする重要度（デフォルト: ERROR）
   * @returns 指定された重要度以上のエラーが存在する場合はtrue
   */
  hasErrors(severity: ValidationSeverity = ValidationSeverity.ERROR): boolean {
    return this.details.some((detail) => detail.severity === severity);
  }

  /**
   * カテゴリー別にエラーを取得
   * @param category - 取得するエラーのカテゴリー
   * @returns 指定されたカテゴリーのエラー詳細の配列
   */
  getErrorsByCategory(category: ValidationCategory): ValidationErrorDetail[] {
    return this.details.filter((detail) => detail.category === category);
  }

  /**
   * 重要度別にエラーを取得
   * @param severity - 取得するエラーの重要度
   * @returns 指定された重要度のエラー詳細の配列
   */
  getErrorsBySeverity(severity: ValidationSeverity): ValidationErrorDetail[] {
    return this.details.filter((detail) => detail.severity === severity);
  }

  /**
   * エラー情報をJSON形式に変換
   * @returns エラーメッセージと詳細情報を含むオブジェクト
   */
  toJSON(): { message: string; details: ValidationErrorDetail[] } {
    return {
      message: this.message,
      details: this.details,
    };
  }
}
