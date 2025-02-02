import { ScoreValidationRules } from "../types/validation";
import { ValidationError } from "./errors";
import { ValidationErrorCodes } from "./types";

/**
 * バリデーションキャッシュのキー生成を担当するクラス
 */
export class ValidationCacheKey {
  /**
   * 値とルールからキャッシュキーを生成する
   */
  static createKey(value: number, rules: ScoreValidationRules): string {
    if (!Number.isFinite(value) || !rules) {
      throw new ValidationError(
        "無効なキーパラメータです",
        ValidationErrorCodes.INVALID_PARAMS
      );
    }
    return `validation:${value}:${JSON.stringify(rules)}`;
  }
}
