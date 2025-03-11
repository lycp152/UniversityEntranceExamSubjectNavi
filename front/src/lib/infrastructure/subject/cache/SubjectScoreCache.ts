import type {
  SubjectScore,
  SubjectMetrics,
} from "@/lib/domain/subject/models/types";
import type { ISubjectScoreCache } from "@/lib/domain/subject/ports/ISubjectScoreCache";
import { SubjectError } from "@/lib/domain/subject/errors/SubjectError";

interface CacheEntry {
  scores: SubjectScore[];
  metrics: SubjectMetrics[];
  timestamp: number;
  lastAccess: number;
  accessCount: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  totalOperations: number;
  averageAccessTime: number;
}

export class SubjectScoreCache implements ISubjectScoreCache {
  private static instance: SubjectScoreCache;
  private readonly cache: Map<string, CacheEntry> = new Map();
  private readonly stats: CacheStats = {
    hits: 0,
    misses: 0,
    totalOperations: 0,
    averageAccessTime: 0,
  };

  private readonly maxEntries = 1000;
  private readonly entryTTL = 1000 * 60 * 60; // 1時間

  private constructor() {
    // 定期的なクリーンアップを設定
    setInterval(() => this.cleanup(), this.entryTTL);
  }

  static getInstance(): SubjectScoreCache {
    if (!SubjectScoreCache.instance) {
      SubjectScoreCache.instance = new SubjectScoreCache();
    }
    return SubjectScoreCache.instance;
  }

  get(
    key: string
  ): { scores: SubjectScore[]; metrics: SubjectMetrics[] } | null {
    const startTime = performance.now();
    this.stats.totalOperations++;

    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    entry.lastAccess = Date.now();
    entry.accessCount++;

    this.updateAccessTime(startTime);
    return {
      scores: entry.scores,
      metrics: entry.metrics,
    };
  }

  set(key: string, scores: SubjectScore[], metrics: SubjectMetrics[]): void {
    try {
      if (this.cache.size >= this.maxEntries) {
        this.evictLeastUsed();
      }

      this.cache.set(key, {
        scores,
        metrics,
        timestamp: Date.now(),
        lastAccess: Date.now(),
        accessCount: 0,
      });
    } catch (error) {
      throw SubjectError.cache("キャッシュの設定に失敗しました", { error });
    }
  }

  private evictLeastUsed(): void {
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.accessCount - b.accessCount
    );

    if (entries.length > 0) {
      this.cache.delete(entries[0][0]);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.entryTTL) {
        this.cache.delete(key);
      }
    }
  }

  private updateAccessTime(startTime: number): void {
    const endTime = performance.now();
    const accessTime = endTime - startTime;
    this.stats.averageAccessTime =
      (this.stats.averageAccessTime * (this.stats.totalOperations - 1) +
        accessTime) /
      this.stats.totalOperations;
  }

  clear(): void {
    this.cache.clear();
    this.resetStats();
  }

  private resetStats(): void {
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.totalOperations = 0;
    this.stats.averageAccessTime = 0;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }
}
