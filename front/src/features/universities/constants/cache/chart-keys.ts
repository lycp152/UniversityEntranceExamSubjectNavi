import { ValidationCategory, ValidationSeverity } from "@/constants/validation";
import { ScoreValidationRules } from "@/types/validation-rules";
import { ValidationError } from "@/lib/validation/error";

/**
 * チャートデータのキャッシュキー生成を担当するクラス
 */
export class ChartDataCacheKey {
  /**
   * キャッシュキーを生成する
   */
  static createKey(value: number, rules: ScoreValidationRules): string {
    if (!Number.isFinite(value) || !rules) {
      throw new ValidationError("無効なキーパラメータです", [
        {
          message: "無効なキーパラメータです",
          category: ValidationCategory.TRANSFORM,
          severity: ValidationSeverity.ERROR,
        },
      ]);
    }
    return `chart-data:${value}:${JSON.stringify(rules)}`;
  }
}
