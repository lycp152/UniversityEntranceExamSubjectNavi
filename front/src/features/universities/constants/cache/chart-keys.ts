import { ValidationSeverity, ValidationErrorCode } from '@/lib/validation/constants';
import { ValidationError, ScoreValidationRules } from '@/lib/validation/types';

/**
 * チャートデータのキャッシュキー生成を担当するクラス
 */
export class ChartDataCacheKey {
  /**
   * キャッシュキーを生成する
   */
  static createKey(value: number, rules: ScoreValidationRules): string {
    if (!Number.isFinite(value) || !rules) {
      const error: ValidationError = {
        field: 'key',
        message: '無効なキーパラメータです',
        code: ValidationErrorCode.INVALID_DATA_FORMAT,
        severity: ValidationSeverity.ERROR,
      };
      throw error;
    }
    return `chart-data:${value}:${JSON.stringify(rules)}`;
  }
}
