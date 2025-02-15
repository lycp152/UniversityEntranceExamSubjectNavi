import { ScoreValidationRules } from '../types/validation';
import { ValidationError } from './errors';
import { ValidationErrorCodes } from './types';

/**
 * チャートデータのキャッシュキー生成を担当するクラス
 */
export class ChartDataCacheKey {
  /**
   * キャッシュキーを生成する
   */
  static createKey(value: number, rules: ScoreValidationRules): string {
    if (!Number.isFinite(value) || !rules) {
      throw new ValidationError('無効なキーパラメータです', ValidationErrorCodes.INVALID_PARAMS);
    }
    return `chart-data:${value}:${JSON.stringify(rules)}`;
  }
}
