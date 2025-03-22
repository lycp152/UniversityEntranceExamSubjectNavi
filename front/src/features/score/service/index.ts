import type { BaseSubjectScore } from "@/types/score/score";
import type { CacheOperationResult } from "@/features/score/lib/operations/operation-results";
import type {
  ScoreCache,
  CacheMetrics,
} from "@/features/score/service/score-cache.types";
import { createCacheKey } from "@/features/score/validation/score-validator3";
import { CACHE_CONFIG } from "@/lib/config/cache";

export class CacheService {
  private readonly cache: Map<string, ScoreCache>;
  private readonly metrics: CacheMetrics;
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cache = new Map();
    this.metrics = {
      hits: 0,
      misses: 0,
      lastCleanup: Date.now(),
      totalOperations: 0,
      averageAccessTime: 0,
      lastAccessTimestamp: Date.now(),
    };

    // 定期的なクリーンアップを設定
    this.cleanupInterval = setInterval(
      () => this.cleanup(CACHE_CONFIG.TTL),
      CACHE_CONFIG.CLEANUP_INTERVAL
    );
  }

  /**
   * キャッシュからスコアを取得
   */
  get(score: BaseSubjectScore): CacheOperationResult<ScoreCache> {
    const startTime = performance.now();
    const key = createCacheKey(score);
    const cached = this.cache.get(key);

    this.metrics.totalOperations++;
    this.metrics.lastAccessTimestamp = Date.now();

    if (cached && Date.now() - cached.lastUpdated <= CACHE_CONFIG.TTL) {
      this.metrics.hits++;
      this.updateAccessMetrics(startTime);
      return {
        success: true,
        data: cached,
        timestamp: Date.now(),
        cacheKey: key,
        cacheHit: true,
      };
    }

    this.metrics.misses++;
    this.updateAccessMetrics(startTime);
    return {
      success: false,
      timestamp: Date.now(),
      cacheKey: key,
      cacheHit: false,
    };
  }

  /**
   * スコアをキャッシュに保存
   */
  set(
    score: BaseSubjectScore,
    value: ScoreCache
  ): CacheOperationResult<ScoreCache> {
    const startTime = performance.now();
    const key = createCacheKey(score);
    const cacheEntry = {
      ...value,
      lastUpdated: Date.now(),
      computedAt: Date.now(),
    };

    try {
      this.cache.set(key, cacheEntry);
      this.updateAccessMetrics(startTime);
      return {
        success: true,
        data: cacheEntry,
        timestamp: Date.now(),
        cacheKey: key,
        cacheHit: false,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
        timestamp: Date.now(),
        cacheKey: key,
        cacheHit: false,
      };
    }
  }

  /**
   * キャッシュのクリーンアップ
   */
  cleanup(maxAge: number): void {
    const now = Date.now();
    let removedEntries = 0;

    for (const [key, value] of this.cache.entries()) {
      if (now - value.lastUpdated > maxAge) {
        this.cache.delete(key);
        removedEntries++;
      }
    }

    this.metrics.lastCleanup = now;
    console.debug(`Cache cleanup completed: removed ${removedEntries} entries`);
  }

  /**
   * アクセス時間の統計を更新
   */
  private updateAccessMetrics(startTime: number): void {
    const accessTime = performance.now() - startTime;
    this.metrics.averageAccessTime =
      (this.metrics.averageAccessTime * (this.metrics.totalOperations - 1) +
        accessTime) /
      this.metrics.totalOperations;
  }

  /**
   * メトリクスの取得
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * キャッシュのクリア
   */
  clear(): void {
    this.cache.clear();
    console.debug("Cache cleared");
  }

  /**
   * リソースの解放
   */
  dispose(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}
