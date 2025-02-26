import { ValidationResult } from "../types/validation";
import { ValidationMetadata } from "./types";
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
  static validateNumber(value: number, errorCode: string): void {
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
}
