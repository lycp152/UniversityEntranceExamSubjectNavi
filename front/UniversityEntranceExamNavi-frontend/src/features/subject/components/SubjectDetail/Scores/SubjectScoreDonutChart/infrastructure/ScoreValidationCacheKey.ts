import { ScoreValidationRules } from '../types/validation';
import { ValidationError } from './errors';
import { ValidationErrorCodes } from './types';

/**
 * スコアバリデーションのキャッシュキー生成を担当するクラス
 */
export class ScoreValidationCacheKey {
  /**
   * キャッシュキーを生成する
   */
  static createKey(value: number, rules: ScoreValidationRules): string {
    if (!Number.isFinite(value) || !rules) {
      throw new ValidationError('無効なキーパラメータです', ValidationErrorCodes.INVALID_PARAMS);
    }
    return `score-validation:${value}:${JSON.stringify(rules)}`;
  }
}
