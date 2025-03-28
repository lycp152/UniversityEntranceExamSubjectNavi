import type { ValidationResult } from "@/types/validation-rules";
import type { BaseSubjectScore } from "@/types/score";

/**
 * スコアのキャッシュデータ型
 */
export interface ScoreCache {
  total?: number;
  maxTotal?: number;
  percentage?: number;
  isValid?: boolean;
  validationResult?: ValidationResult<BaseSubjectScore>;
  lastUpdated: number;
  computedAt: number;
}

/**
 * キャッシュメトリクス型
 */
export interface CacheMetrics {
  hits: number;
  misses: number;
  lastCleanup: number;
  totalOperations: number;
  averageAccessTime: number;
  lastAccessTimestamp: number;
}
