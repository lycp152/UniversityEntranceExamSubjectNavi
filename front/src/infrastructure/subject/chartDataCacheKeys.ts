import { ScoreValidationRules } from "@/components/features/charts/subject/donut/types/validation";
import { ValidationError } from "@/components/features/university/domain/validators/ValidationError";
import {
  ValidationCategory as ValidationErrorCodes,
  ValidationSeverity,
} from "@/components/features/university/domain/validators/ValidationErrorTypes";

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
          category: ValidationErrorCodes.SYSTEM,
          severity: ValidationSeverity.ERROR,
        },
      ]);
    }
    return `chart-data:${value}:${JSON.stringify(rules)}`;
  }
}
