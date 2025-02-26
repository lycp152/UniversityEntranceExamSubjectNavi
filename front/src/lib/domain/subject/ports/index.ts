import type {
  SubjectScore,
  CalculationResult,
  ValidationResult,
  MetricsStats,
  CacheEntry,
} from '../../../../domain/subject/models/types';

// 科目バリデータのインターフェース
export interface ISubjectValidator {
  validateBatch(scores: SubjectScore[]): ValidationResult;
  validate(score: SubjectScore): ValidationResult;
  getValidationRules(): string[];
}

// メトリクスコレクタのインターフェース
export interface ISubjectMetricsCollector {
  collectMetrics(scores: SubjectScore[]): CalculationResult;
  getStoredMetrics(key: string): CalculationResult | undefined;
  clearMetrics(): void;
  getMetricsStats(): MetricsStats;
}

// キャッシュのインターフェース
export interface ISubjectScoreCache {
  get<T>(key: string): CacheEntry<T> | null;
  set<T>(key: string, data: T, metadata?: Record<string, unknown>): void;
  clear(): void;
  getStats(): {
    hits: number;
    misses: number;
    totalOperations: number;
    averageAccessTime: number;
    cacheSize: number;
  };
}

// スコアサービスの依存関係
export interface IScoreServiceDependencies {
  validator: ISubjectValidator;
  cache: ISubjectScoreCache;
  metricsCollector: ISubjectMetricsCollector;
}
