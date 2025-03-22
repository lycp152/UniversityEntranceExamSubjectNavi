import { ScoreValidator } from "@/features/score/service/scoreValidationService";
import { CacheService } from ".";
import { MetricsService } from "@/features/score/service/score-metrics-service";

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
