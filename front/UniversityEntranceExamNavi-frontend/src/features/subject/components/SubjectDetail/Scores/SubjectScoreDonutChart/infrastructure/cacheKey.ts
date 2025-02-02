import { ScoreValidationRules } from "../types/validation";
import { ValidationError } from "./errors";
import { ValidationErrorCodes } from "./types";

/**
 * キャッシュキーの生成を担当するクラス
 */
export class CacheKeyGenerator {
  /**
   * バリデーション用のキャッシュキーを生成
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
