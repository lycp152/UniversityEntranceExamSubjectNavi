import { Severity } from "@/types/api/endpoints/monitoring";
import { CompressionMetrics } from "./compression";

export interface AlertBase {
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

export interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  totalOperations: number;
  memoryUsage: number;
  concurrentOperations: number;
  maxConcurrentOperations: number;
  queueLength: number;
  errors: {
    total: number;
    byType: Map<string, number>;
    recoveryAttempts: number;
    recoverySuccess: number;
  };
  cacheEfficiency: {
    compressionRatio: number;
    averageEntrySize: number;
    lruHitRate: number;
    averageAge: number;
  };
  performance: {
    operationTimes: Map<string, number[]>;
    averageResponseTime: number;
    slowestOperations: Array<{
      operation: string;
      duration: number;
      timestamp: number;
    }>;
    bottlenecks: {
      concurrency: boolean;
      memory: boolean;
      responseTime: boolean;
    };
    warnings: string[];
    trends: {
      responseTime: Array<{
        timestamp: number;
        value: number;
      }>;
      throughput: Array<{
        timestamp: number;
        value: number;
      }>;
      errorRate: Array<{
        timestamp: number;
        value: number;
      }>;
    };
    alerts: {
      active: Array<{
        type: string;
        message: string;
        severity: "critical" | "warning" | "info";
        timestamp: number;
        metadata?: Record<string, unknown>;
      }>;
      history: Array<{
        type: string;
        message: string;
        severity: "critical" | "warning" | "info";
        startTime: number;
        endTime: number;
        duration: number;
        metadata?: Record<string, unknown>;
      }>;
    };
    healthScore: {
      current: number;
      history: Array<{
        timestamp: number;
        score: number;
        factors: Record<string, number>;
      }>;
    };
  };
  compression: CompressionMetrics;
  scaling: {
    currentScale: number;
    lastScaleTime: number;
    scaleHistory: Array<{
      timestamp: number;
      scale: number;
      reason: string;
    }>;
    resourceUsage: {
      cpu: number;
      memory: number;
      operations: number;
    };
  };
}

export class MetricsManager {
  private readonly metrics: CacheMetrics;

  constructor() {
    this.metrics = this.initializeMetrics();
  }

  private initializeMetrics(): CacheMetrics {
    return {
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
        byType: new Map(),
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
        operationTimes: new Map(),
        averageResponseTime: 0,
        slowestOperations: [],
        bottlenecks: {
          concurrency: false,
          memory: false,
          responseTime: false,
        },
        warnings: [],
        trends: {
          responseTime: [],
          throughput: [],
          errorRate: [],
        },
        alerts: {
          active: [],
          history: [],
        },
        healthScore: {
          current: 100,
          history: [],
        },
      },
      compression: {
        totalSaved: 0,
        compressionRatio: 0,
        compressedEntries: 0,
        averageCompressionTime: 0,
        byStrategy: new Map(),
        adaptiveThreshold: 0,
      },
      scaling: {
        currentScale: 1,
        lastScaleTime: Date.now(),
        scaleHistory: [],
        resourceUsage: {
          cpu: 0,
          memory: 0,
          operations: 0,
        },
      },
    };
  }

  recordHit(): void {
    this.metrics.hits++;
    this.metrics.totalOperations++;
  }

  recordMiss(): void {
    this.metrics.misses++;
    this.metrics.totalOperations++;
  }

  recordEviction(): void {
    this.metrics.evictions++;
  }

  updateMemoryUsage(usage: number): void {
    this.metrics.memoryUsage = usage;
  }

  updateConcurrentOperations(count: number): void {
    this.metrics.concurrentOperations = count;
    this.metrics.maxConcurrentOperations = Math.max(
      this.metrics.maxConcurrentOperations,
      count
    );
  }

  updateQueueLength(length: number): void {
    this.metrics.queueLength = length;
  }

  recordError(type: string): void {
    this.metrics.errors.total++;
    const currentCount = this.metrics.errors.byType.get(type) ?? 0;
    this.metrics.errors.byType.set(type, currentCount + 1);
  }

  recordRecoveryAttempt(success: boolean): void {
    this.metrics.errors.recoveryAttempts++;
    if (success) {
      this.metrics.errors.recoverySuccess++;
    }
  }

  updateCacheEfficiency(
    efficiency: Partial<CacheMetrics["cacheEfficiency"]>
  ): void {
    this.metrics.cacheEfficiency = {
      ...this.metrics.cacheEfficiency,
      ...efficiency,
    };
  }

  recordOperationTime(operation: string, duration: number): void {
    const times = this.metrics.performance.operationTimes.get(operation) || [];
    times.push(duration);
    this.metrics.performance.operationTimes.set(operation, times);

    // Update slowest operations
    this.metrics.performance.slowestOperations.push({
      operation,
      duration,
      timestamp: Date.now(),
    });
    this.metrics.performance.slowestOperations.sort(
      (a, b) => b.duration - a.duration
    );
    this.metrics.performance.slowestOperations =
      this.metrics.performance.slowestOperations.slice(0, 10);
  }

  updateHealthScore(score: number, factors: Record<string, number>): void {
    this.metrics.performance.healthScore.current = score;
    this.metrics.performance.healthScore.history.push({
      timestamp: Date.now(),
      score,
      factors,
    });
  }

  addAlert(alert: ActiveAlert): void {
    this.metrics.performance.alerts.active.push(alert);
  }

  resolveAlert(
    type: string,
    resolutionDetails: string,
    preventiveMeasures: string[]
  ): void {
    const alert = this.metrics.performance.alerts.active.find(
      (a) => a.type === type
    );
    if (alert) {
      const historyAlert: AlertHistory = {
        ...alert,
        startTime: alert.timestamp,
        endTime: Date.now(),
        duration: Date.now() - alert.timestamp,
        resolutionDetails,
        preventiveMeasures,
      };
      this.metrics.performance.alerts.history.push(historyAlert);
      this.metrics.performance.alerts.active =
        this.metrics.performance.alerts.active.filter((a) => a.type !== type);
    }
  }

  updateScaling(scale: number, reason: string): void {
    this.metrics.scaling.currentScale = scale;
    this.metrics.scaling.lastScaleTime = Date.now();
    this.metrics.scaling.scaleHistory.push({
      timestamp: Date.now(),
      scale,
      reason,
    });
  }

  updateResourceUsage(
    usage: Partial<CacheMetrics["scaling"]["resourceUsage"]>
  ): void {
    this.metrics.scaling.resourceUsage = {
      ...this.metrics.scaling.resourceUsage,
      ...usage,
    };
  }

  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }
}
