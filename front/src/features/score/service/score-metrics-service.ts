import type {
  Alert,
  AlertHistory,
  PerformanceMetrics,
  AlertType,
  Trend,
} from "@/lib/monitoring";
import type { BaseSubjectScore } from "@/types/score/score";
import type { ValidationOperationResult } from "@/features/score/lib/operations/operation-results";

export class MetricsService {
  private readonly metrics: PerformanceMetrics;
  private static readonly TREND_WINDOW = 60 * 60 * 1000; // 1時間
  private static readonly HEALTH_SCORE_WINDOW = 5 * 60 * 1000; // 5分

  constructor() {
    this.metrics = this.initializeMetrics();
  }

  /**
   * メトリクスの初期化
   */
  private initializeMetrics(): PerformanceMetrics {
    return {
      trends: {
        responseTime: [],
        throughput: [],
        errorRate: [],
        memoryUsage: [],
        cacheEfficiency: [],
      },
      warnings: [],
      alerts: {
        active: [],
        history: [],
      },
      healthScore: {
        current: 100,
        history: [],
      },
    };
  }

  /**
   * バリデーション結果からメトリクスを更新
   */
  updateMetrics(result: ValidationOperationResult<BaseSubjectScore>): void {
    const timestamp = Date.now();

    if (result.timestamp) {
      const duration = timestamp - result.timestamp;
      this.updateResponseTime(duration, timestamp);
    }

    if (!result.success) {
      this.updateErrorRate(timestamp);
      this.checkThresholds();
    }

    this.updateThroughput(timestamp);
    this.calculateHealthScore(timestamp);
    this.cleanupOldData(timestamp);
  }

  /**
   * レスポンスタイムの更新
   */
  private updateResponseTime(duration: number, timestamp: number): void {
    this.metrics.trends.responseTime.push({
      value: duration,
      timestamp,
      operation: "validation",
    });
  }

  /**
   * エラー率の更新
   */
  private updateErrorRate(timestamp: number): void {
    this.metrics.trends.errorRate.push({
      value: 1,
      timestamp,
      errorType: "validation_error",
    });
  }

  /**
   * スループットの更新
   */
  private updateThroughput(timestamp: number): void {
    this.metrics.trends.throughput.push({
      value: 1,
      timestamp,
    });
  }

  /**
   * 古いデータの削除
   */
  private cleanupOldData(currentTimestamp: number): void {
    const trendCutoff = currentTimestamp - MetricsService.TREND_WINDOW;
    const healthScoreCutoff =
      currentTimestamp - MetricsService.HEALTH_SCORE_WINDOW;

    // トレンドデータのクリーンアップ
    const { trends } = this.metrics;
    trends.responseTime = trends.responseTime.filter(
      (item) => item.timestamp > trendCutoff
    );
    trends.throughput = trends.throughput.filter(
      (item) => item.timestamp > trendCutoff
    );
    trends.errorRate = trends.errorRate.filter(
      (item) => item.timestamp > trendCutoff
    );
    trends.memoryUsage = trends.memoryUsage.filter(
      (item) => item.timestamp > trendCutoff
    );
    trends.cacheEfficiency = trends.cacheEfficiency.filter(
      (item) => item.timestamp > trendCutoff
    );

    // ヘルススコア履歴のクリーンアップ
    this.metrics.healthScore.history = this.metrics.healthScore.history.filter(
      (item) => item.timestamp > healthScoreCutoff
    );
  }

  /**
   * ヘルススコアの計算
   */
  private calculateHealthScore(timestamp: number): void {
    const weights = {
      responseTime: 0.3,
      errorRate: 0.3,
      throughput: 0.2,
      cacheEfficiency: 0.1,
      resourceUtilization: 0.1,
    };

    const scores = {
      responseTime: this.calculateMetricScore(this.metrics.trends.responseTime),
      errorRate: this.calculateMetricScore(this.metrics.trends.errorRate),
      throughput: this.calculateMetricScore(this.metrics.trends.throughput),
      cacheEfficiency: this.calculateCacheEfficiencyScore(),
      resourceUtilization: this.calculateResourceUtilizationScore(),
      memoryUsage: this.calculateMetricScore(this.metrics.trends.memoryUsage),
    };

    const score = Math.max(
      0,
      Math.min(
        100,
        Object.entries(weights).reduce(
          (total, [key, weight]) =>
            total + scores[key as keyof typeof scores] * weight,
          0
        )
      )
    );

    this.metrics.healthScore.current = score;
    this.metrics.healthScore.history.push({
      timestamp,
      score,
      factors: scores,
      breakdown: {
        performance: (scores.responseTime + scores.throughput) / 2,
        reliability: scores.errorRate,
        efficiency: (scores.cacheEfficiency + scores.resourceUtilization) / 2,
      },
    });
  }

  /**
   * メトリックスコアの計算
   */
  private calculateMetricScore(
    trend: { value: number; timestamp: number }[]
  ): number {
    if (trend.length === 0) return 100;

    const recentValues = trend
      .filter(
        (item) =>
          item.timestamp > Date.now() - MetricsService.HEALTH_SCORE_WINDOW
      )
      .map((item) => item.value);

    if (recentValues.length === 0) return 100;

    const average =
      recentValues.reduce((sum, value) => sum + value, 0) / recentValues.length;
    return Math.max(0, Math.min(100, 100 - average * 10));
  }

  /**
   * キャッシュ効率スコアの計算
   */
  private calculateCacheEfficiencyScore(): number {
    const trend = this.metrics.trends.cacheEfficiency;
    if (trend.length === 0) return 100;

    const recent = trend[trend.length - 1];
    return Math.max(0, Math.min(100, recent.hitRate * 100));
  }

  /**
   * リソース使用率スコアの計算
   */
  private calculateResourceUtilizationScore(): number {
    const trend = this.metrics.trends.memoryUsage;
    if (trend.length === 0) return 100;

    const recent = trend[trend.length - 1];
    return Math.max(0, Math.min(100, 100 - (recent.value / 1024 / 1024) * 10));
  }

  /**
   * しきい値のチェック
   */
  private checkThresholds(): void {
    this.checkResponseTimeThreshold();
    this.checkErrorRateThreshold();
    this.checkThroughputThreshold();
  }

  /**
   * レスポンスタイムのしきい値チェック
   */
  private checkResponseTimeThreshold(): void {
    const recent = this.getRecentAverageResponseTime();
    if (recent > 1000) {
      this.addAlert({
        type: "responseTime",
        message: "High response time detected",
        severity: "warning",
        timestamp: Date.now(),
        category: "performance",
        threshold: 1000,
        currentValue: recent,
        trend: this.calculateTrend(this.metrics.trends.responseTime),
        recommendations: ["Check system load", "Optimize validation logic"],
      });
    }
  }

  /**
   * エラー率のしきい値チェック
   */
  private checkErrorRateThreshold(): void {
    const recent = this.getRecentErrorRate();
    if (recent > 0.1) {
      this.addAlert({
        type: "errorRate",
        message: "High error rate detected",
        severity: "error",
        timestamp: Date.now(),
        category: "reliability",
        threshold: 0.1,
        currentValue: recent,
        trend: this.calculateTrend(this.metrics.trends.errorRate),
        recommendations: [
          "Review validation rules",
          "Check input data quality",
        ],
      });
    }
  }

  /**
   * スループットのしきい値チェック
   */
  private checkThroughputThreshold(): void {
    const recent = this.getRecentThroughput();
    if (recent < 10) {
      this.addAlert({
        type: "throughput",
        message: "Low throughput detected",
        severity: "warning",
        timestamp: Date.now(),
        category: "performance",
        threshold: 10,
        currentValue: recent,
        trend: this.calculateTrend(this.metrics.trends.throughput),
        recommendations: [
          "Check system resources",
          "Review concurrent operations",
        ],
      });
    }
  }

  /**
   * 最近のレスポンスタイムの平均を取得
   */
  private getRecentAverageResponseTime(): number {
    const recent = this.metrics.trends.responseTime
      .filter((item) => item.timestamp > Date.now() - 5 * 60 * 1000)
      .map((item) => item.value);
    return recent.length > 0
      ? recent.reduce((sum, value) => sum + value, 0) / recent.length
      : 0;
  }

  /**
   * 最近のエラー率を取得
   */
  private getRecentErrorRate(): number {
    const recent = this.metrics.trends.errorRate.filter(
      (item) => item.timestamp > Date.now() - 5 * 60 * 1000
    );
    return recent.length > 0
      ? recent.length / this.metrics.trends.throughput.length
      : 0;
  }

  /**
   * 最近のスループットを取得
   */
  private getRecentThroughput(): number {
    const recent = this.metrics.trends.throughput.filter(
      (item) => item.timestamp > Date.now() - 5 * 60 * 1000
    );
    return recent.length;
  }

  /**
   * トレンドの計算
   */
  private calculateTrend(data: { value: number; timestamp: number }[]): Trend {
    if (data.length < 2) return "stable";

    const recent = data.slice(-5);
    const values = recent.map((item) => item.value);
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const difference = lastValue - firstValue;

    if (Math.abs(difference) < 0.1) return "stable";
    return difference > 0 ? "increasing" : "decreasing";
  }

  /**
   * メトリクスの取得
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * アラートの追加
   */
  addAlert(alert: Alert): void {
    // 同じタイプの既存のアラートを確認
    const existingAlert = this.metrics.alerts.active.find(
      (a) => a.type === alert.type
    );
    if (!existingAlert) {
      this.metrics.alerts.active.push(alert);
      const alertHistory: AlertHistory = {
        ...alert,
        startTime: Date.now(),
        endTime: 0,
        duration: 0,
        resolutionDetails: "",
        preventiveMeasures: [],
      };
      this.metrics.alerts.history.push(alertHistory);
    }
  }

  /**
   * アラートの解決
   */
  resolveAlert(
    type: AlertType,
    resolutionDetails: string,
    preventiveMeasures: string[]
  ): void {
    const now = Date.now();
    const alertIndex = this.metrics.alerts.active.findIndex(
      (alert) => alert.type === type
    );

    if (alertIndex !== -1) {
      this.metrics.alerts.active.splice(alertIndex, 1);

      const historyAlert = this.metrics.alerts.history.find(
        (history) => history.type === type && history.endTime === 0
      );

      if (historyAlert) {
        historyAlert.endTime = now;
        historyAlert.duration = now - historyAlert.startTime;
        historyAlert.resolutionDetails = resolutionDetails;
        historyAlert.preventiveMeasures = preventiveMeasures;
      }
    }
  }

  /**
   * アラート履歴の取得
   */
  getAlertHistory(): AlertHistory[] {
    return [...this.metrics.alerts.history];
  }
}
