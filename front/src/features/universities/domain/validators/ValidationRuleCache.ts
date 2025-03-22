import type { ValidationRule } from "@/types/validation/validation";

interface CacheMetrics {
  hits: number;
  misses: number;
  lastAccess: number;
  totalOperations: number;
}

interface CacheEntry<T> {
  rules: ValidationRule<T>[];
  lastAccess: number;
  hits: number;
}

export class ValidationRuleCache<T> {
  private static instance: unknown;
  private readonly cache: Map<string, CacheEntry<T>> = new Map();
  private readonly metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    lastAccess: Date.now(),
    totalOperations: 0,
  };

  private constructor() {
    // 定期的なキャッシュクリーンアップを設定
    setInterval(() => this.cleanupCache(), 1000 * 60 * 60); // 1時間ごと
  }

  static getInstance<T>(): ValidationRuleCache<T> {
    if (!ValidationRuleCache.instance) {
      ValidationRuleCache.instance = new ValidationRuleCache<T>();
    }
    return ValidationRuleCache.instance as ValidationRuleCache<T>;
  }

  getCachedRules(key: string): ValidationRule<T>[] | undefined {
    this.metrics.totalOperations++;
    const entry = this.cache.get(key);

    if (entry) {
      this.metrics.hits++;
      entry.hits++;
      entry.lastAccess = Date.now();
      return entry.rules;
    }

    this.metrics.misses++;
    return undefined;
  }

  setCachedRules(key: string, rules: ValidationRule<T>[]): void {
    this.metrics.totalOperations++;
    this.cache.set(key, {
      rules,
      lastAccess: Date.now(),
      hits: 0,
    });
  }

  private cleanupCache(): void {
    const now = Date.now();
    const ONE_HOUR = 1000 * 60 * 60;

    for (const [key, entry] of this.cache.entries()) {
      // 1時間以上アクセスがないエントリーを削除
      if (now - entry.lastAccess > ONE_HOUR && entry.hits < 10) {
        this.cache.delete(key);
      }
    }
  }

  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  clearCache(): void {
    this.cache.clear();
    this.resetMetrics();
  }

  private resetMetrics(): void {
    this.metrics.hits = 0;
    this.metrics.misses = 0;
    this.metrics.lastAccess = Date.now();
    this.metrics.totalOperations = 0;
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  getCacheKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  getHitRate(): number {
    const total = this.metrics.hits + this.metrics.misses;
    return total === 0 ? 0 : this.metrics.hits / total;
  }
}
