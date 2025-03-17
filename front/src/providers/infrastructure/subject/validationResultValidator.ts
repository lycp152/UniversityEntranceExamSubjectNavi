import { ValidationResult } from "@/features/charts/subject/donut/types/validation";
import {
  ValidationMetadata,
  ValidationErrorCodes,
  ValidationErrorCode,
} from "./types";
import { ValidationError } from "./errors";

/**
 * バリデーション結果の検証を行うクラス
 */
export class ValidationResultValidator {
  /** 有効な数値の最小値 */
  private static readonly MIN_VALID_NUMBER = 0;

  /**
   * メタデータの型チェックを行う
   */
  static isValidMetadata(value: unknown): value is ValidationMetadata {
    if (!value || typeof value !== "object") return false;
    const metadata = value as Partial<ValidationMetadata>;
    return (
      typeof metadata.validatedAt === "number" &&
      metadata.validatedAt > 0 &&
      Array.isArray(metadata.rules)
    );
  }

  /**
   * バリデーション結果の型チェックを行う
   */
  static isValidResult(value: unknown): value is ValidationResult {
    if (!value || typeof value !== "object") return false;
    const result = value as Partial<ValidationResult>;
    return (
      typeof result.isValid === "boolean" &&
      Array.isArray(result.errors) &&
      (!result.metadata || this.isValidMetadata(result.metadata))
    );
  }

  /**
   * 数値の妥当性チェックを行う
   */
  static validateNumber(
    value: number,
    errorCode: ValidationErrorCode = ValidationErrorCodes.INVALID_NUMBER
  ): void {
    if (!Number.isFinite(value)) {
      throw new ValidationError("値は有限数である必要があります", errorCode);
    }
    if (value <= this.MIN_VALID_NUMBER) {
      throw new ValidationError(
        `値は${this.MIN_VALID_NUMBER}より大きい必要があります`,
        errorCode
      );
    }
  }

  /**
   * バリデーション結果全体の整合性チェック
   */
  static validateResultConsistency(result: ValidationResult): void {
    if (!this.isValidResult(result)) {
      throw new ValidationError(
        "無効なバリデーション結果です",
        ValidationErrorCodes.INVALID_RESULT
      );
    }

    if (result.isValid && result.errors.length > 0) {
      throw new ValidationError(
        "有効な結果に対してエラーが存在します",
        ValidationErrorCodes.INVALID_RESULT
      );
    }

    if (!result.isValid && result.errors.length === 0) {
      throw new ValidationError(
        "無効な結果に対してエラーが存在しません",
        ValidationErrorCodes.INVALID_RESULT
      );
    }

    if (result.metadata && result.metadata.validatedAt > Date.now()) {
      throw new ValidationError(
        "未来の時刻が設定されています",
        ValidationErrorCodes.INVALID_METADATA
      );
    }
  }
}
