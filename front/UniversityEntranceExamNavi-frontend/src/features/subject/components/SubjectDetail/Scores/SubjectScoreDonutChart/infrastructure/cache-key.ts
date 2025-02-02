import { ScoreValidationRules } from "../types/validation";
import { ValidationError } from "./errors";

export class CacheKeyGenerator {
  static createKey(value: number, rules: ScoreValidationRules): string {
    if (!Number.isFinite(value) || !rules) {
      throw new ValidationError(
        "無効なキーパラメータです",
        "INVALID_KEY_PARAMS"
      );
    }
    return `validation:${value}:${JSON.stringify(rules)}`;
  }
}
