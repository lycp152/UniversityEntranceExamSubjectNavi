import {
  ScoreValidationRules,
  ValidationCategory as ValidationErrorCodes,
  ValidationSeverity,
} from "@/types/validation";
import { ValidationError } from "@/lib/validation/error";

/**
 * スコアバリデーションのキャッシュキー生成を担当するクラス
 */
export class ScoreValidationCacheKey {
  /**
   * キャッシュキーを生成する
   */
  static createKey(value: number, rules: ScoreValidationRules): string {
    if (!Number.isFinite(value) || !rules) {
      throw new ValidationError("無効なキーパラメータです", [
        {
          message: "無効なキーパラメータです",
          category: ValidationErrorCodes.SYSTEM,
          severity: ValidationSeverity.ERROR,
        },
      ]);
    }
    return `score-validation:${value}:${JSON.stringify(rules)}`;
  }
}
