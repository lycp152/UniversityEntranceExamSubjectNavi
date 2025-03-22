import { CacheMetrics } from "./metrics";

export interface PerformanceConfig {
  maxResponseTime: number;
  maxConcurrentOperations: number;
  maxMemoryUsage: number;
  healthCheckInterval: number;
  trendWindowSize: number;
}

export class PerformanceManager {
  private readonly config: PerformanceConfig;
  private readonly metrics: CacheMetrics;
  private readonly healthCheckInterval: NodeJS.Timeout;

  constructor(config: PerformanceConfig, metrics: CacheMetrics) {
    this.config = config;
    this.metrics = metrics;
    this.healthCheckInterval = setInterval(
      () => this.checkHealth(),
      config.healthCheckInterval
    );
  }

  private checkHealth(): void {
    const healthScore = this.calculateHealthScore();
    const factors = this.calculateHealthFactors();

    this.metrics.performance.healthScore.current = healthScore;
    this.metrics.performance.healthScore.history.push({
      timestamp: Date.now(),
      score: healthScore,
      factors,
    });

    this.updateTrends();
    this.checkBottlenecks();
    this.generateAlerts();
  }

  private calculateHealthScore(): number {
    const factors = this.calculateHealthFactors();
    const weights = {
      responseTime: 0.3,
      concurrency: 0.2,
      memory: 0.2,
      errors: 0.2,
      efficiency: 0.1,
    };

    return (
      Math.round(
        (1 - factors.responseTime) * weights.responseTime +
          (1 - factors.concurrency) * weights.concurrency +
          (1 - factors.memory) * weights.memory +
          (1 - factors.errors) * weights.errors +
          factors.efficiency * weights.efficiency
      ) * 100
    );
  }

  private calculateHealthFactors(): Record<string, number> {
    const responseTimeFactor = Math.min(
      this.metrics.performance.averageResponseTime /
        this.config.maxResponseTime,
      1
    );

    const concurrencyFactor = Math.min(
      this.metrics.concurrentOperations / this.config.maxConcurrentOperations,
      1
    );

    const memoryFactor = Math.min(
      this.metrics.memoryUsage / this.config.maxMemoryUsage,
      1
    );

    const errorFactor = Math.min(
      this.metrics.errors.total / (this.metrics.totalOperations || 1),
      1
    );

    const efficiencyFactor = this.metrics.cacheEfficiency.lruHitRate;

    return {
      responseTime: responseTimeFactor,
      concurrency: concurrencyFactor,
      memory: memoryFactor,
      errors: errorFactor,
      efficiency: efficiencyFactor,
    };
  }

  private updateTrends(): void {
    const now = Date.now();
    const windowSize = this.config.trendWindowSize;

    // Update response time trend
    this.metrics.performance.trends.responseTime.push({
      timestamp: now,
      value: this.metrics.performance.averageResponseTime,
    });
    this.metrics.performance.trends.responseTime =
      this.metrics.performance.trends.responseTime.filter(
        (point) => now - point.timestamp <= windowSize
      );

    // Update throughput trend
    this.metrics.performance.trends.throughput.push({
      timestamp: now,
      value: this.metrics.totalOperations,
    });
    this.metrics.performance.trends.throughput =
      this.metrics.performance.trends.throughput.filter(
        (point) => now - point.timestamp <= windowSize
      );

    // Update error rate trend
    this.metrics.performance.trends.errorRate.push({
      timestamp: now,
      value: this.metrics.errors.total / (this.metrics.totalOperations || 1),
    });
    this.metrics.performance.trends.errorRate =
      this.metrics.performance.trends.errorRate.filter(
        (point) => now - point.timestamp <= windowSize
      );
  }

  private checkBottlenecks(): void {
    this.metrics.performance.bottlenecks = {
      concurrency:
        this.metrics.concurrentOperations >=
        this.config.maxConcurrentOperations,
      memory: this.metrics.memoryUsage >= this.config.maxMemoryUsage,
      responseTime:
        this.metrics.performance.averageResponseTime >=
        this.config.maxResponseTime,
    };
  }

  private generateAlerts(): void {
    const bottlenecks = this.metrics.performance.bottlenecks;
    const healthScore = this.metrics.performance.healthScore.current;

    if (bottlenecks.concurrency) {
      this.metrics.performance.alerts.active.push({
        type: "high_concurrency",
        message: "High concurrent operations detected",
        severity: "warning",
        timestamp: Date.now(),
        metadata: {
          current: this.metrics.concurrentOperations,
          max: this.config.maxConcurrentOperations,
        },
      });
    }

    if (bottlenecks.memory) {
      this.metrics.performance.alerts.active.push({
        type: "high_memory",
        message: "High memory usage detected",
        severity: "warning",
        timestamp: Date.now(),
        metadata: {
          current: this.metrics.memoryUsage,
          max: this.config.maxMemoryUsage,
        },
      });
    }

    if (bottlenecks.responseTime) {
      this.metrics.performance.alerts.active.push({
        type: "high_response_time",
        message: "High response time detected",
        severity: "warning",
        timestamp: Date.now(),
        metadata: {
          current: this.metrics.performance.averageResponseTime,
          max: this.config.maxResponseTime,
        },
      });
    }

    if (healthScore < 50) {
      this.metrics.performance.alerts.active.push({
        type: "low_health_score",
        message: "Low health score detected",
        severity: "critical",
        timestamp: Date.now(),
        metadata: {
          score: healthScore,
          factors: this.calculateHealthFactors(),
        },
      });
    }
  }

  public stop(): void {
    clearInterval(this.healthCheckInterval);
  }
}
