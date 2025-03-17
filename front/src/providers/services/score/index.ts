import { ScoreValidator } from '../validation/scoreValidationService';
import { CacheService } from '../cache/cacheService';
import { MetricsService } from '../monitoring/metricsService';

// サービスのシングルトンインスタンス
let scoreValidatorInstance: ScoreValidator | null = null;
let cacheServiceInstance: CacheService | null = null;
let metricsServiceInstance: MetricsService | null = null;

// サービスのインスタンス取得
export const getScoreValidator = (): ScoreValidator => {
  if (!scoreValidatorInstance) {
    scoreValidatorInstance = new ScoreValidator();
  }
  return scoreValidatorInstance;
};

export const getCacheService = (): CacheService => {
  if (!cacheServiceInstance) {
    cacheServiceInstance = new CacheService();
  }
  return cacheServiceInstance;
};

export const getMetricsService = (): MetricsService => {
  if (!metricsServiceInstance) {
    metricsServiceInstance = new MetricsService();
  }
  return metricsServiceInstance;
};

// サービスのエクスポート
export { ScoreValidator, CacheService, MetricsService };
