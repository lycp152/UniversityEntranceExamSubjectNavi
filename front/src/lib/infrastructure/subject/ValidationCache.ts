"use server";

import {
  ValidationResult,
  ScoreValidationRules,
} from "@/components/features/charts/subject/donut/types/validation";
import { cache } from "react";
import { unstable_cache, revalidateTag } from "next/cache";
import { ValidationError } from "./errors";
import { ValidationResultValidator } from "./validators";
import { ChartDataCacheKey as ValidationCacheKey } from "./chartDataCacheKeys";
import { CacheOptions, StorageProvider, ValidationErrorCodes } from "./types";
import { gzip, gunzip } from "zlib";
import {
  Severity,
  Priority,
  MemoryType,
  Strategy,
} from "@/components/features/charts/subject/donut/types/errors";

interface AlertBase {
  type: string;
  message: string;
  severity: Severity;
  metadata?: Record<string, unknown>;
}

export interface ActiveAlert extends AlertBase {
  timestamp: number;
}

export interface HistoryAlert extends AlertBase {
  startTime: number;
  endTime: number;
  duration: number;
}

export interface AlertHistory extends AlertBase {
  startTime: number;
  endTime: number;
  duration: number;
  resolutionDetails: string;
  preventiveMeasures: string[];
}

export interface PerformanceMetrics {
  trends: {
    responseTime: Array<{
      timestamp: number;
      value: number;
      operation: string;
    }>;
    throughput: Array<{ timestamp: number; value: number }>;
    errorRate: Array<{ timestamp: number; value: number; errorType: string }>;
    memoryUsage: Array<{ timestamp: number; value: number; type: MemoryType }>;
    cacheEfficiency: Array<{
      timestamp: number;
      hitRate: number;
      missRate: number;
    }>;
  };
  warnings: Array<{
    timestamp: number;
    message: string;
    category: string;
    priority: Priority;
    impact: string;
  }>;
  operationTimes: Map<string, number[]>;
  averageResponseTime: number;
  bottlenecks: {
    concurrency: boolean;
    memory: boolean;
    responseTime: boolean;
  };
}

export class ValidationCache {
  private readonly ttl: number;
  private readonly revalidateSeconds: number;
  private readonly cacheTag = "validation-cache";
  private readonly storage: StorageProvider;
  private maxCacheSize: number;
  private cacheSize = 0;
  private lastCleanupTime = Date.now();
  private readonly cleanupInterval = 5 * 60 * 1000; // 5分

  // LRUキャッシュのための追加プロパティ
  private readonly lruMap = new Map<string, number>();
  private readonly compressionThreshold = 1024 * 50; // 50KB

  private readonly compressionConfig = {
    threshold: 1024 * 50,
    minCompressionRatio: 0.7,
    maxCompressionTime: 100,
    adaptiveThresholds: {
      enabled: true,
      minEntrySize: 1024 * 10,
      maxEntrySize: 1024 * 1000,
      targetCompressionRatio: 0.5,
    },
    strategies: ["gzip", "base64"] as Strategy[],
  };

  private readonly metrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalOperations: 0,
    memoryUsage: 0,
    concurrentOperations: 0,
    maxConcurrentOperations: 0,
    queueLength: 0,
    errors: {
      total: 0,
      byType: new Map<string, number>(),
      recoveryAttempts: 0,
      recoverySuccess: 0,
    },
    cacheEfficiency: {
      compressionRatio: 0,
      averageEntrySize: 0,
      lruHitRate: 0,
      averageAge: 0,
    },
    performance: {
      operationTimes: new Map<string, number[]>(),
      averageResponseTime: 0,
      slowestOperations: [] as Array<{
        operation: string;
        duration: number;
        timestamp: number;
      }>,
      bottlenecks: {
        concurrency: false,
        memory: false,
        responseTime: false,
      },
      warnings: [] as string[],
      trends: {
        responseTime: [] as Array<{
          timestamp: number;
          value: number;
        }>,
        throughput: [] as Array<{
          timestamp: number;
          value: number;
        }>,
        errorRate: [] as Array<{
          timestamp: number;
          value: number;
        }>,
      },
      alerts: {
        active: [] as Array<{
          type: string;
          message: string;
          severity: "critical" | "warning" | "info";
          timestamp: number;
          metadata?: Record<string, unknown>;
        }>,
        history: [] as Array<{
          type: string;
          message: string;
          severity: "critical" | "warning" | "info";
          startTime: number;
          endTime: number;
          duration: number;
          metadata?: Record<string, unknown>;
        }>,
      },
      healthScore: {
        current: 100,
        history: [] as Array<{
          timestamp: number;
          score: number;
          factors: Record<string, number>;
        }>,
      },
    },
    compression: {
      totalSaved: 0,
      compressionRatio: 0,
      compressedEntries: 0,
      averageCompressionTime: 0,
      byStrategy: new Map<
        string,
        {
          totalSize: number;
          compressedSize: number;
          compressionTime: number;
          successCount: number;
          failureCount: number;
        }
      >(),
      adaptiveThreshold: this.compressionConfig.threshold,
    },
    scaling: {
      currentScale: 1,
      lastScaleTime: Date.now(),
      scaleHistory: [] as Array<{
        timestamp: number;
        scale: number;
        reason: string;
      }>,
      resourceUsage: {
        cpu: 0,
        memory: 0,
        operations: 0,
      },
    },
  };

  private readonly operationQueue: Array<() => Promise<void>> = [];
  private maxConcurrentOperations: number;
  private readonly operationTimeout = 5000; // 5秒
  private readonly locks = new Map<string, Promise<void>>();

  private readonly maxRetryAttempts = 3;
  private readonly retryDelays = [1000, 2000, 5000]; // ミリ秒単位の再試行間隔

  private readonly performanceThresholds = {
    maxResponseTime: 1000, // 1秒
    maxQueueLength: 10,
    maxMemoryUsage: 1024 * 1024 * 200, // 200MB
    slowOperationThreshold: 500, // 500ミリ秒
  };

  private readonly scalingConfig = {
    minScale: 0.5,
    maxScale: 2.0,
    scaleStep: 0.1,
    cooldownPeriod: 60000, // 1分
    thresholds: {
      cpu: 80, // 80%
      memory: 70, // 70%
      operations: 100, // 100 operations per minute
    },
  };

  private readonly performanceConfig = {
    trendRetentionPeriod: 24 * 60 * 60 * 1000, // 24時間
    healthScoreFactors: {
      responseTime: 0.3,
      errorRate: 0.3,
      memoryUsage: 0.2,
      cacheEfficiency: 0.2,
    },
    alertThresholds: {
      responseTime: {
        warning: 800, // ms
        critical: 1500, // ms
      },
      errorRate: {
        warning: 5, // 5%
        critical: 10, // 10%
      },
      memoryUsage: {
        warning: 70, // 70%
        critical: 90, // 90%
      },
    },
  };

  constructor(options: CacheOptions) {
    const { ttl = 5 * 60 * 1000, storage, maxCacheSize = 1000 } = options;

    ValidationResultValidator.validateNumber(
      ttl,
      ValidationErrorCodes.INVALID_NUMBER
    );
    ValidationResultValidator.validateNumber(
      maxCacheSize,
      ValidationErrorCodes.INVALID_NUMBER
    );

    this.ttl = ttl;
    this.revalidateSeconds = Math.floor(ttl / 1000);
    this.maxCacheSize = maxCacheSize;
    this.maxConcurrentOperations = 5;
    this.storage = storage ?? {
      get: async () => null,
      set: async () => {},
      flushAll: async () => {},
    };
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: { key: string; operationType: string }
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.recordError(lastError, context);

        if (this.shouldRetry(error, attempt)) {
          this.metrics.errors.recoveryAttempts++;
          await this.wait(this.retryDelays[attempt]);
          continue;
        }
        break;
      }
    }

    throw this.enhanceError(lastError!, context);
  }

  private shouldRetry(error: unknown, attempt: number): boolean {
    if (attempt >= this.maxRetryAttempts) return false;
    if (error instanceof ValidationError) {
      return error.code === ValidationErrorCodes.CACHE_ERROR;
    }
    return true;
  }

  private recordError(
    error: Error,
    context: { key: string; operationType: string }
  ): void {
    this.metrics.errors.total++;
    const errorType =
      error instanceof ValidationError ? error.code : "UNKNOWN_ERROR";
    const currentCount = this.metrics.errors.byType.get(errorType) ?? 0;
    this.metrics.errors.byType.set(errorType, currentCount + 1);
    this.metrics.performance.warnings.push(
      `エラー発生: ${context.operationType} (キー: ${context.key})`
    );
  }

  private enhanceError(
    error: Error,
    context: { key: string; operationType: string }
  ): Error {
    if (error instanceof ValidationError) {
      return new ValidationError(
        `${error.message} (操作: ${context.operationType}, キー: ${context.key})`,
        error.code
      );
    }
    return error;
  }

  private async wait(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getErrorMetrics(): Record<string, unknown> {
    return {
      total: this.metrics.errors.total,
      byType: Object.fromEntries(this.metrics.errors.byType),
      recoveryRate: this.calculateRecoveryRate(),
      lastErrors: Array.from(this.metrics.errors.byType.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    };
  }

  private calculateRecoveryRate(): number {
    return this.metrics.errors.recoveryAttempts === 0
      ? 0
      : Math.round(
          (this.metrics.errors.recoverySuccess /
            this.metrics.errors.recoveryAttempts) *
            100
        );
  }

  private measureOperationTime<T>(
    operation: () => Promise<T>,
    operationType: string
  ): Promise<T> {
    const startTime = performance.now();
    return operation().then((result) => {
      const duration = performance.now() - startTime;
      this.recordOperationTime(operationType, duration);
      this.checkPerformanceThresholds(operationType, duration);
      return result;
    });
  }

  private recordOperationTime(operationType: string, duration: number): void {
    const times =
      this.metrics.performance.operationTimes.get(operationType) ?? [];
    times.push(duration);

    // 最新の100件のみを保持
    if (times.length > 100) {
      times.shift();
    }

    this.metrics.performance.operationTimes.set(operationType, times);
    this.updateAverageResponseTime();
    this.trackSlowestOperations(operationType, duration);
  }

  private updateAverageResponseTime(): void {
    let totalTime = 0;
    let totalOperations = 0;

    this.metrics.performance.operationTimes.forEach((times) => {
      totalTime += times.reduce((sum, time) => sum + time, 0);
      totalOperations += times.length;
    });

    this.metrics.performance.averageResponseTime =
      totalOperations > 0 ? totalTime / totalOperations : 0;
  }

  private trackSlowestOperations(
    operationType: string,
    duration: number
  ): void {
    const slowestOps = this.metrics.performance.slowestOperations;

    slowestOps.push({
      operation: operationType,
      duration,
      timestamp: Date.now(),
    });

    slowestOps.sort((a, b) => b.duration - a.duration);
    this.metrics.performance.slowestOperations = slowestOps.slice(0, 10);
  }

  private checkPerformanceThresholds(
    operationType: string,
    duration: number
  ): void {
    const warnings = this.metrics.performance.warnings;
    const bottlenecks = this.metrics.performance.bottlenecks;

    // レスポンスタイムのチェック
    if (duration > this.performanceThresholds.maxResponseTime) {
      bottlenecks.responseTime = true;
      warnings.push(
        `遅い操作を検出: ${operationType} (${Math.round(duration)}ms)`
      );
    }

    // 同時実行数のチェック
    if (this.metrics.concurrentOperations >= this.maxConcurrentOperations) {
      bottlenecks.concurrency = true;
      warnings.push("同時実行数が上限に達しています");
    }

    // メモリ使用量のチェック
    if (this.metrics.memoryUsage >= this.performanceThresholds.maxMemoryUsage) {
      bottlenecks.memory = true;
      warnings.push("メモリ使用量が警告閾値を超えています");
    }

    // 警告は最新の10件のみを保持
    this.metrics.performance.warnings = warnings.slice(-10);
  }

  private getPerformanceMetrics(): Record<string, unknown> {
    return {
      ...this.metrics.performance,
      trends: {
        responseTime: this.metrics.performance.trends.responseTime.slice(-60), // 直近60件のみ
        throughput: this.metrics.performance.trends.throughput.slice(-60),
        errorRate: this.metrics.performance.trends.errorRate.slice(-60),
      },
      healthScore: {
        current: this.metrics.performance.healthScore.current,
        history: this.metrics.performance.healthScore.history.slice(-24), // 直近24件のみ
      },
      alerts: {
        active: this.metrics.performance.alerts.active.slice(-10), // 直近10件のみ
        recent: this.metrics.performance.alerts.history.slice(-10), // 直近10件のみ
      },
    };
  }

  private async validateAndCache(
    value: number,
    rules: ScoreValidationRules
  ): Promise<ValidationResult | null> {
    const validationResult = await this.retrieveValidationResult(value, rules);
    if (validationResult) {
      this.metrics.hits++;
      return validationResult;
    }
    this.metrics.misses++;
    return null;
  }

  private async executeValidation(
    value: number,
    rules: ScoreValidationRules
  ): Promise<ValidationResult | null> {
    if (!Number.isFinite(value) || !rules) {
      throw new ValidationError(
        "無効なパラメータです",
        ValidationErrorCodes.INVALID_PARAMS
      );
    }

    const cacheKey = ValidationCacheKey.createKey(value, rules);
    return this.executeWithRetry(
      async () => {
        const result = await unstable_cache(
          () => this.validateAndCache(value, rules),
          [cacheKey],
          {
            revalidate: this.revalidateSeconds,
            tags: [this.cacheTag],
          }
        )();
        return result;
      },
      { key: cacheKey, operationType: "get" }
    );
  }

  get = cache(
    async (
      value: number,
      rules: ScoreValidationRules
    ): Promise<ValidationResult | null> => {
      this.metrics.totalOperations++;
      await this.checkAndCleanup();

      return this.measureOperationTime(
        () => this.executeValidation(value, rules),
        "get"
      );
    }
  );

  private async executeWithConcurrencyControl<T>(
    key: string,
    operation: () => Promise<T>
  ): Promise<T> {
    while (this.metrics.concurrentOperations >= this.maxConcurrentOperations) {
      this.metrics.queueLength++;
      await new Promise((resolve) => setTimeout(resolve, 100));
      this.metrics.queueLength--;
    }

    const existingLock = this.locks.get(key);
    if (existingLock) {
      await existingLock;
    }

    this.metrics.concurrentOperations++;
    this.metrics.maxConcurrentOperations = Math.max(
      this.metrics.maxConcurrentOperations,
      this.metrics.concurrentOperations
    );

    const lock = (async () => {
      try {
        const timeoutPromise = new Promise<T>((_, reject) => {
          setTimeout(
            () => reject(new Error("操作がタイムアウトしました")),
            this.operationTimeout
          );
        });
        const result = await Promise.race([operation(), timeoutPromise]);
        return result;
      } finally {
        this.metrics.concurrentOperations--;
        this.locks.delete(key);
      }
    })();

    this.locks.set(key, lock as Promise<void>);
    return lock;
  }

  private async checkAndCleanup(): Promise<void> {
    const now = Date.now();
    if (now - this.lastCleanupTime >= this.cleanupInterval) {
      await this.performCleanup();
      await this.adjustResources();
      this.lastCleanupTime = now;
    }
  }

  private async performCleanup(): Promise<void> {
    try {
      const memoryUsage = process.memoryUsage();
      this.metrics.memoryUsage = memoryUsage.heapUsed;

      if (this.shouldPerformCleanup()) {
        const evictedCount = await this.evictExpiredEntries();
        this.metrics.evictions += evictedCount;
      }
    } catch {
      throw new ValidationError(
        "キャッシュのクリーンアップに失敗しました",
        ValidationErrorCodes.CACHE_ERROR
      );
    }
  }

  private shouldPerformCleanup(): boolean {
    return (
      this.cacheSize >= this.maxCacheSize * 0.8 || // 80%以上使用
      this.metrics.memoryUsage >= 1024 * 1024 * 100
    ); // 100MB以上使用
  }

  private async evictExpiredEntries(): Promise<number> {
    let evictedCount = 0;
    const now = Date.now();
    const entries = Array.from(this.lruMap.entries());

    // LRUに基づいて古いエントリを削除
    const expiredEntries = entries
      .filter(([, timestamp]) => now - timestamp >= this.ttl)
      .sort(([, a], [, b]) => a - b);

    for (const [key] of expiredEntries) {
      await this.removeFromStorage(key);
      evictedCount++;
    }

    // キャッシュサイズが上限を超えている場合、最も古いエントリを削除
    while (this.cacheSize > this.maxCacheSize * 0.8) {
      const oldestEntry = entries
        .filter(
          ([key]) => !expiredEntries.some(([expiredKey]) => expiredKey === key)
        )
        .sort(([, a], [, b]) => a - b)[0];

      if (oldestEntry) {
        await this.removeFromStorage(oldestEntry[0]);
        evictedCount++;
      } else {
        break;
      }
    }

    this.updateCacheEfficiencyMetrics();
    return evictedCount;
  }

  private async removeFromStorage(key: string): Promise<void> {
    this.lruMap.delete(key);
    this.cacheSize--;
    // ストレージからの削除は実装依存のため、必要に応じて実装
    await this.storage.set(key, "", { ttl: 0 });
  }

  private updateLRUEntry(key: string): void {
    this.lruMap.delete(key);
    this.lruMap.set(key, Date.now());
  }

  private async compressData(data: string): Promise<string> {
    const startTime = performance.now();
    const originalSize = data.length;

    try {
      // 圧縮が必要かどうかを判断
      if (!this.shouldCompress(data)) {
        return data;
      }

      // 最適な圧縮戦略を選択
      const strategy = await this.selectCompressionStrategy(data);
      const compressed = await this.compressWithStrategy(data, strategy);
      const endTime = performance.now();

      // 圧縮結果の評価と統計の更新
      this.updateCompressionMetrics(
        originalSize,
        compressed.length,
        endTime - startTime,
        strategy
      );
      this.adjustAdaptiveThresholds(originalSize, compressed.length);

      return compressed;
    } catch (error) {
      const endTime = performance.now();
      this.recordCompressionFailure(error, endTime - startTime);
      throw new ValidationError(
        "データの圧縮に失敗しました",
        ValidationErrorCodes.CACHE_ERROR
      );
    }
  }

  private shouldCompress(data: string): boolean {
    const size = data.length;
    return (
      size >= this.metrics.compression.adaptiveThreshold &&
      size >= this.compressionConfig.adaptiveThresholds.minEntrySize &&
      size <= this.compressionConfig.adaptiveThresholds.maxEntrySize
    );
  }

  private async evaluateCompressionStrategy(
    strategy: (typeof this.compressionConfig.strategies)[number],
    data: string
  ) {
    try {
      const startTime = performance.now();
      const compressed = await this.compressWithStrategy(data, strategy);
      const endTime = performance.now();
      const ratio = compressed.length / data.length;
      const time = endTime - startTime;

      return {
        strategy,
        ratio,
        time,
        size: compressed.length,
      };
    } catch {
      return null;
    }
  }

  private calculateStrategyScore(result: { ratio: number; time: number }) {
    return (
      result.ratio * 0.7 +
      (1 - result.time / this.compressionConfig.maxCompressionTime) * 0.3
    );
  }

  private async selectCompressionStrategy(
    data: string
  ): Promise<(typeof this.compressionConfig.strategies)[number]> {
    const strategies = this.compressionConfig.strategies;
    const results = await Promise.all(
      strategies.map((strategy) =>
        this.evaluateCompressionStrategy(strategy, data)
      )
    );

    const validResults = results.filter(
      (result): result is NonNullable<typeof result> => result !== null
    );

    if (validResults.length === 0) return "gzip";

    return validResults.reduce((best, current) => {
      if (!best) return current;
      const bestScore = this.calculateStrategyScore(best);
      const currentScore = this.calculateStrategyScore(current);
      return currentScore > bestScore ? current : best;
    }, validResults[0]).strategy;
  }

  private async compressWithStrategy(
    data: string,
    strategy: (typeof this.compressionConfig.strategies)[number]
  ): Promise<string> {
    switch (strategy) {
      case "gzip":
        return this.compressWithGzip(data);
      case "base64":
        return Buffer.from(data).toString("base64");
      default:
        throw new Error(`未対応の圧縮戦略: ${strategy}`);
    }
  }

  private async compressWithGzip(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const buffer = encoder.encode(data);
    const compressed = await new Promise<Uint8Array>((resolve, reject) => {
      gzip(buffer, (error, result) => {
        if (error) reject(error);
        resolve(new Uint8Array(result.buffer));
      });
    });
    return Buffer.from(compressed).toString("base64");
  }

  private adjustAdaptiveThresholds(
    originalSize: number,
    compressedSize: number
  ): void {
    if (!this.compressionConfig.adaptiveThresholds.enabled) return;

    const ratio = compressedSize / originalSize;
    const targetRatio =
      this.compressionConfig.adaptiveThresholds.targetCompressionRatio;
    const currentThreshold = this.metrics.compression.adaptiveThreshold;

    if (ratio > targetRatio) {
      // 圧縮率が目標より悪い場合、閾値を上げる
      this.metrics.compression.adaptiveThreshold = Math.min(
        currentThreshold * 1.1,
        this.compressionConfig.adaptiveThresholds.maxEntrySize
      );
    } else {
      // 圧縮率が目標より良い場合、閾値を下げる
      this.metrics.compression.adaptiveThreshold = Math.max(
        currentThreshold * 0.9,
        this.compressionConfig.adaptiveThresholds.minEntrySize
      );
    }
  }

  private recordCompressionFailure(error: unknown, duration: number): void {
    const strategy = "gzip";
    const stats = this.getCompressionStats(strategy);
    stats.failureCount++;
    stats.compressionTime += duration;
    this.metrics.compression.byStrategy.set(strategy, stats);
  }

  private getCompressionStats(strategy: string) {
    return (
      this.metrics.compression.byStrategy.get(strategy) ?? {
        totalSize: 0,
        compressedSize: 0,
        compressionTime: 0,
        successCount: 0,
        failureCount: 0,
      }
    );
  }

  private updateCompressionMetrics(
    originalSize: number,
    compressedSize: number,
    compressionTime: number,
    strategy: string
  ): void {
    // 全体の統計を更新
    const saved = originalSize - compressedSize;
    this.metrics.compression.totalSaved += saved;
    this.metrics.compression.compressedEntries++;
    this.metrics.compression.compressionRatio =
      (this.metrics.compression.totalSaved /
        (this.metrics.memoryUsage + this.metrics.compression.totalSaved)) *
      100;
    this.metrics.compression.averageCompressionTime =
      (this.metrics.compression.averageCompressionTime *
        (this.metrics.compression.compressedEntries - 1) +
        compressionTime) /
      this.metrics.compression.compressedEntries;

    // 戦略ごとの統計を更新
    const stats = this.getCompressionStats(strategy);
    stats.totalSize += originalSize;
    stats.compressedSize += compressedSize;
    stats.compressionTime += compressionTime;
    stats.successCount++;
    this.metrics.compression.byStrategy.set(strategy, stats);
  }

  private updateCacheEfficiencyMetrics(): void {
    const totalEntries = this.lruMap.size;
    if (totalEntries === 0) return;

    const now = Date.now();
    const accessTimes = Array.from(this.lruMap.values());
    const averageAge =
      accessTimes.reduce((sum, time) => sum + (now - time), 0) / totalEntries;

    this.metrics.cacheEfficiency = {
      ...this.metrics.cacheEfficiency,
      averageEntrySize: Math.round(this.metrics.memoryUsage / totalEntries),
      lruHitRate: Math.round(
        (this.metrics.hits / this.metrics.totalOperations) * 100
      ),
      averageAge: Math.round(averageAge),
    };
  }

  getMetrics(): Record<string, unknown> {
    return {
      ...this.metrics,
      hitRate: this.calculateHitRate(),
      cacheSize: this.cacheSize,
      memoryUsageMB: Math.round(this.metrics.memoryUsage / (1024 * 1024)),
      errors: this.getErrorMetrics(),
      cacheEfficiency: this.metrics.cacheEfficiency,
      performance: this.getPerformanceMetrics(),
      scaling: {
        currentScale: this.metrics.scaling.currentScale,
        resourceUsage: this.metrics.scaling.resourceUsage,
        history: this.metrics.scaling.scaleHistory,
      },
    };
  }

  private calculateHitRate(): number {
    const total = this.metrics.hits + this.metrics.misses;
    return total === 0 ? 0 : Math.round((this.metrics.hits / total) * 100);
  }

  private async retrieveValidationResult(
    value: number,
    rules: ScoreValidationRules
  ): Promise<ValidationResult | null> {
    const cacheKey = ValidationCacheKey.createKey(value, rules);
    this.updateLRUEntry(cacheKey);

    const result = await this.fetchValidationResult(value, rules);
    if (!result?.metadata?.validatedAt) return null;

    const isExpired = Date.now() - result.metadata.validatedAt >= this.ttl;
    if (isExpired) {
      await this.removeFromStorage(cacheKey);
      return null;
    }

    return result;
  }

  set = async (
    value: number,
    rules: ScoreValidationRules,
    result: ValidationResult
  ): Promise<void> => {
    if (
      !Number.isFinite(value) ||
      !rules ||
      !ValidationResultValidator.isValidResult(result)
    ) {
      throw new ValidationError(
        "無効なパラメータです",
        ValidationErrorCodes.INVALID_PARAMS
      );
    }

    const cacheKey = ValidationCacheKey.createKey(value, rules);
    await this.executeWithConcurrencyControl(cacheKey, async () => {
      await this.ensureCacheCapacity();
      await this.storeValidationResult(value, rules, result);
    });
  };

  private async ensureCacheCapacity(): Promise<void> {
    if (this.cacheSize >= this.maxCacheSize) {
      await this.clear();
    }
  }

  async clear(): Promise<void> {
    try {
      await this.storage.flushAll();
      this.cacheSize = 0;
      revalidateTag(this.cacheTag);
    } catch {
      throw new ValidationError(
        "キャッシュのクリアに失敗しました",
        ValidationErrorCodes.CACHE_ERROR
      );
    }
  }

  private async fetchValidationResult(
    value: number,
    rules: ScoreValidationRules
  ): Promise<ValidationResult | null> {
    try {
      const cached = await this.storage.get(
        ValidationCacheKey.createKey(value, rules)
      );
      if (!cached) return null;

      const isCompressed = this.isCompressedData(cached);
      const decodedData = isCompressed
        ? await this.decompressData(cached)
        : cached;

      const parsed = JSON.parse(decodedData);
      return ValidationResultValidator.isValidResult(parsed) ? parsed : null;
    } catch {
      throw new ValidationError(
        "キャッシュの取得に失敗しました",
        ValidationErrorCodes.CACHE_ERROR
      );
    }
  }

  private isCompressedData(data: string): boolean {
    try {
      return Buffer.from(data, "base64").length > 0;
    } catch {
      return false;
    }
  }

  private async adjustResources(): Promise<void> {
    const now = Date.now();
    if (
      now - this.metrics.scaling.lastScaleTime <
      this.scalingConfig.cooldownPeriod
    ) {
      return;
    }

    const currentUsage = await this.getCurrentResourceUsage();
    this.metrics.scaling.resourceUsage = currentUsage;

    const newScale = this.calculateNewScale(currentUsage);
    if (newScale !== this.metrics.scaling.currentScale) {
      await this.applyNewScale(newScale);
    }
  }

  private async getCurrentResourceUsage(): Promise<{
    cpu: number;
    memory: number;
    operations: number;
  }> {
    const memoryUsage = process.memoryUsage();
    const heapUsedPercentage =
      (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    return {
      cpu:
        (this.metrics.concurrentOperations / this.maxConcurrentOperations) *
        100,
      memory: heapUsedPercentage,
      operations: this.calculateOperationsPerMinute(),
    };
  }

  private calculateOperationsPerMinute(): number {
    const oneMinuteAgo = Date.now() - 60000;
    const recentOperations = Array.from(
      this.metrics.performance.operationTimes.values()
    )
      .flat()
      .filter((time) => time > oneMinuteAgo);
    return recentOperations.length;
  }

  private calculateNewScale(usage: {
    cpu: number;
    memory: number;
    operations: number;
  }): number {
    let scaleMultiplier = 1;

    if (usage.cpu > this.scalingConfig.thresholds.cpu) {
      scaleMultiplier += this.scalingConfig.scaleStep;
    }
    if (usage.memory > this.scalingConfig.thresholds.memory) {
      scaleMultiplier += this.scalingConfig.scaleStep;
    }
    if (usage.operations > this.scalingConfig.thresholds.operations) {
      scaleMultiplier += this.scalingConfig.scaleStep;
    }

    const newScale = this.metrics.scaling.currentScale * scaleMultiplier;
    return Math.max(
      this.scalingConfig.minScale,
      Math.min(this.scalingConfig.maxScale, newScale)
    );
  }

  private async applyNewScale(newScale: number): Promise<void> {
    const oldScale = this.metrics.scaling.currentScale;
    const reason = this.getScalingReason(oldScale, newScale);

    this.metrics.scaling.currentScale = newScale;
    this.metrics.scaling.lastScaleTime = Date.now();
    this.metrics.scaling.scaleHistory.push({
      timestamp: Date.now(),
      scale: newScale,
      reason,
    });

    // スケール履歴は最新の10件のみ保持
    if (this.metrics.scaling.scaleHistory.length > 10) {
      this.metrics.scaling.scaleHistory.shift();
    }

    // リソースの調整
    this.maxConcurrentOperations = Math.round(5 * newScale);
    this.maxCacheSize = Math.round(1000 * newScale);

    // 必要に応じてキャッシュのクリーンアップを実行
    if (newScale < oldScale) {
      await this.performCleanup();
    }
  }

  private getScalingReason(oldScale: number, newScale: number): string {
    const usage = this.metrics.scaling.resourceUsage;
    const reasons: string[] = [];

    if (usage.cpu > this.scalingConfig.thresholds.cpu) {
      reasons.push("高CPU使用率");
    }
    if (usage.memory > this.scalingConfig.thresholds.memory) {
      reasons.push("高メモリ使用率");
    }
    if (usage.operations > this.scalingConfig.thresholds.operations) {
      reasons.push("高負荷な操作数");
    }

    return `${reasons.join(", ")} (${oldScale} → ${newScale})`;
  }

  private updatePerformanceMetrics(
    operationType: string,
    duration: number
  ): void {
    this.recordOperationTime(operationType, duration);
    this.updateTrends();
    this.calculateHealthScore();
    this.checkAlerts();
  }

  private updateTrends(): void {
    const now = Date.now();
    const trends = this.metrics.performance.trends;

    // レスポンスタイムのトレンド更新
    trends.responseTime.push({
      timestamp: now,
      value: this.metrics.performance.averageResponseTime,
    });

    // スループットのトレンド更新
    const recentOperations = this.calculateOperationsPerMinute();
    trends.throughput.push({
      timestamp: now,
      value: recentOperations,
    });

    // エラー率のトレンド更新
    const errorRate = this.calculateErrorRate();
    trends.errorRate.push({
      timestamp: now,
      value: errorRate,
    });

    // 古いデータの削除
    const cutoffTime = now - this.performanceConfig.trendRetentionPeriod;
    trends.responseTime = trends.responseTime.filter(
      (item) => item.timestamp > cutoffTime
    );
    trends.throughput = trends.throughput.filter(
      (item) => item.timestamp > cutoffTime
    );
    trends.errorRate = trends.errorRate.filter(
      (item) => item.timestamp > cutoffTime
    );
  }

  private calculateErrorRate(): number {
    const total = this.metrics.totalOperations;
    return total === 0 ? 0 : (this.metrics.errors.total / total) * 100;
  }

  private calculateHealthScore(): void {
    const factors = {
      responseTime: this.calculateResponseTimeHealth(),
      errorRate: this.calculateErrorRateHealth(),
      memoryUsage: this.calculateMemoryHealth(),
      cacheEfficiency: this.calculateCacheEfficiencyHealth(),
    };

    const score = Object.entries(factors).reduce((total, [factor, value]) => {
      return (
        total +
        value *
          (this.performanceConfig.healthScoreFactors[
            factor as keyof typeof this.performanceConfig.healthScoreFactors
          ] || 0)
      );
    }, 0);

    this.metrics.performance.healthScore.current = Math.round(score);
    this.metrics.performance.healthScore.history.push({
      timestamp: Date.now(),
      score: Math.round(score),
      factors,
    });

    // 履歴は最新の100件のみ保持
    if (this.metrics.performance.healthScore.history.length > 100) {
      this.metrics.performance.healthScore.history.shift();
    }
  }

  private calculateResponseTimeHealth(): number {
    const avgResponseTime = this.metrics.performance.averageResponseTime;
    const { warning, critical } =
      this.performanceConfig.alertThresholds.responseTime;

    if (avgResponseTime >= critical) return 0;
    if (avgResponseTime >= warning) {
      return 100 - ((avgResponseTime - warning) / (critical - warning)) * 50;
    }
    return 100;
  }

  private calculateErrorRateHealth(): number {
    const errorRate = this.calculateErrorRate();
    const { warning, critical } =
      this.performanceConfig.alertThresholds.errorRate;

    if (errorRate >= critical) return 0;
    if (errorRate >= warning) {
      return 100 - ((errorRate - warning) / (critical - warning)) * 50;
    }
    return 100;
  }

  private calculateMemoryHealth(): number {
    const memoryUsage =
      (this.metrics.memoryUsage / this.performanceThresholds.maxMemoryUsage) *
      100;
    const { warning, critical } =
      this.performanceConfig.alertThresholds.memoryUsage;

    if (memoryUsage >= critical) return 0;
    if (memoryUsage >= warning) {
      return 100 - ((memoryUsage - warning) / (critical - warning)) * 50;
    }
    return 100;
  }

  private calculateCacheEfficiencyHealth(): number {
    const hitRate = this.calculateHitRate();
    return hitRate; // キャッシュヒット率をそのまま健全性スコアとして使用
  }

  private checkAlerts(): void {
    const alerts = this.metrics.performance.alerts;
    const now = Date.now();

    // 新しいアラートの検出
    this.checkResponseTimeAlert(now);
    this.checkErrorRateAlert(now);
    this.checkMemoryUsageAlert(now);

    // アクティブなアラートの更新
    alerts.active = alerts.active.filter((alert) => {
      const isStillActive = this.isAlertStillActive(alert);
      if (!isStillActive) {
        alerts.history.push({
          ...alert,
          startTime: alert.timestamp,
          endTime: now,
          duration: now - alert.timestamp,
        });
      }
      return isStillActive;
    });

    // 履歴は最新の100件のみ保持
    if (alerts.history.length > 100) {
      alerts.history = alerts.history.slice(-100);
    }
  }

  private checkResponseTimeAlert(timestamp: number): void {
    const avgResponseTime = this.metrics.performance.averageResponseTime;
    const { warning, critical } =
      this.performanceConfig.alertThresholds.responseTime;

    if (avgResponseTime >= critical) {
      this.addAlert(
        "HIGH_RESPONSE_TIME",
        `応答時間が危険な水準です: ${Math.round(avgResponseTime)}ms`,
        "critical",
        timestamp
      );
    } else if (avgResponseTime >= warning) {
      this.addAlert(
        "HIGH_RESPONSE_TIME",
        `応答時間が警告水準です: ${Math.round(avgResponseTime)}ms`,
        "warning",
        timestamp
      );
    }
  }

  private checkErrorRateAlert(timestamp: number): void {
    const errorRate = this.calculateErrorRate();
    const { warning, critical } =
      this.performanceConfig.alertThresholds.errorRate;

    if (errorRate >= critical) {
      this.addAlert(
        "HIGH_ERROR_RATE",
        `エラー率が危険な水準です: ${Math.round(errorRate)}%`,
        "critical",
        timestamp
      );
    } else if (errorRate >= warning) {
      this.addAlert(
        "HIGH_ERROR_RATE",
        `エラー率が警告水準です: ${Math.round(errorRate)}%`,
        "warning",
        timestamp
      );
    }
  }

  private checkMemoryUsageAlert(timestamp: number): void {
    const memoryUsage =
      (this.metrics.memoryUsage / this.performanceThresholds.maxMemoryUsage) *
      100;
    const { warning, critical } =
      this.performanceConfig.alertThresholds.memoryUsage;

    if (memoryUsage >= critical) {
      this.addAlert(
        "HIGH_MEMORY_USAGE",
        `メモリ使用率が危険な水準です: ${Math.round(memoryUsage)}%`,
        "critical",
        timestamp
      );
    } else if (memoryUsage >= warning) {
      this.addAlert(
        "HIGH_MEMORY_USAGE",
        `メモリ使用率が警告水準です: ${Math.round(memoryUsage)}%`,
        "warning",
        timestamp
      );
    }
  }

  private addAlert(
    type: string,
    message: string,
    severity: Severity,
    timestamp: number
  ): void {
    const existingAlert = this.metrics.performance.alerts.active.find(
      (alert) => alert.type === type
    );
    if (!existingAlert) {
      this.metrics.performance.alerts.active.push({
        type,
        message,
        severity,
        timestamp,
      });
    }
  }

  private isAlertStillActive(alert: {
    type: string;
    severity: Severity;
  }): boolean {
    switch (alert.type) {
      case "HIGH_RESPONSE_TIME":
        return (
          this.metrics.performance.averageResponseTime >=
          this.performanceConfig.alertThresholds.responseTime[
            alert.severity === "critical" ? "critical" : "warning"
          ]
        );
      case "HIGH_ERROR_RATE":
        return (
          this.calculateErrorRate() >=
          this.performanceConfig.alertThresholds.errorRate[
            alert.severity === "critical" ? "critical" : "warning"
          ]
        );
      case "HIGH_MEMORY_USAGE":
        return (
          (this.metrics.memoryUsage /
            this.performanceThresholds.maxMemoryUsage) *
            100 >=
          this.performanceConfig.alertThresholds.memoryUsage[
            alert.severity === "critical" ? "critical" : "warning"
          ]
        );
      default:
        return false;
    }
  }

  private async decompressData(data: string): Promise<string> {
    const compressed = new Uint8Array(Buffer.from(data, "base64"));
    return new Promise((resolve, reject) => {
      gunzip(compressed, (error, result) => {
        if (error) reject(new Error(error.message));
        resolve(new TextDecoder().decode(new Uint8Array(result.buffer)));
      });
    });
  }

  private async storeValidationResult(
    value: number,
    rules: ScoreValidationRules,
    result: ValidationResult
  ): Promise<void> {
    const cacheKey = ValidationCacheKey.createKey(value, rules);
    const validatedResult = {
      ...result,
      metadata: {
        validatedAt: Date.now(),
        rules: result.metadata?.rules ?? [],
        compressed: false,
      },
    };

    const serializedData = JSON.stringify(validatedResult);
    const shouldCompress = this.shouldCompress(serializedData);
    const dataToStore = shouldCompress
      ? await this.compressData(serializedData)
      : serializedData;

    if (shouldCompress) {
      validatedResult.metadata.compressed = true;
    }

    await this.storage.set(cacheKey, dataToStore, {
      ttl: this.ttl,
    });

    this.updateLRUEntry(cacheKey);
    this.cacheSize++;
    revalidateTag(this.cacheTag);
  }
}
