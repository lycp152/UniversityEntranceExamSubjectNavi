import type { Severity } from "../operations/core";
import type { ErrorSeverity } from "@/types/errors/categories";

/**
 * アラートカテゴリーの定義
 */
export type AlertCategory =
  | "performance"
  | "reliability"
  | "resources"
  | "security"
  | "availability";

/**
 * アラートタイプの定義
 */
export type AlertType =
  | "responseTime"
  | "throughput"
  | "errorRate"
  | "memoryUsage"
  | "cacheEfficiency"
  | "resourceUtilization"
  | "concurrency"
  | "dataIntegrity"
  | "systemHealth";

export type Trend = "increasing" | "decreasing" | "stable";
export type Priority = "high" | "medium" | "low";

/**
 * 基本トレンドアイテムのインターフェース
 */
interface BaseTrendItem {
  timestamp: number;
  value: number;
}

/**
 * レスポンスタイムのトレンドアイテム
 */
interface ResponseTimeTrendItem extends BaseTrendItem {
  operation: string;
}

/**
 * エラーレートのトレンドアイテム
 */
interface ErrorRateTrendItem extends BaseTrendItem {
  errorType: string;
}

/**
 * メモリ使用量のトレンドアイテム
 */
interface MemoryUsageTrendItem extends BaseTrendItem {
  type: "heap" | "rss";
}

/**
 * キャッシュ効率のトレンドアイテム
 */
interface CacheEfficiencyTrendItem {
  timestamp: number;
  hitRate: number;
  missRate: number;
}

/**
 * パフォーマンスメトリクスのインターフェース
 */
export interface PerformanceMetrics {
  trends: {
    responseTime: ResponseTimeTrendItem[];
    throughput: BaseTrendItem[];
    errorRate: ErrorRateTrendItem[];
    memoryUsage: MemoryUsageTrendItem[];
    cacheEfficiency: CacheEfficiencyTrendItem[];
  };
  warnings: Array<{
    timestamp: number;
    message: string;
    category: string;
    priority: Priority;
    impact: string;
  }>;
  alerts: {
    active: Alert[];
    history: AlertHistory[];
  };
  healthScore: {
    current: number;
    history: Array<{
      timestamp: number;
      score: number;
      factors: {
        responseTime: number;
        errorRate: number;
        memoryUsage: number;
        cacheEfficiency: number;
        resourceUtilization: number;
      };
      breakdown: {
        performance: number;
        reliability: number;
        efficiency: number;
      };
    }>;
  };
}

/**
 * アラートのインターフェース
 */
export interface Alert {
  type: AlertType;
  message: string;
  severity: Severity;
  timestamp: number;
  category: AlertCategory;
  threshold: number;
  currentValue: number;
  trend: Trend;
  recommendations: string[];
}

/**
 * アラート履歴のインターフェース
 */
export interface AlertHistory extends Alert {
  startTime: number;
  endTime: number;
  duration: number;
  resolutionDetails: string;
  preventiveMeasures: string[];
}

/**
 * エラーコンテキストのインターフェース
 */
export interface ErrorContext {
  errorType: string;
  timestamp: number;
  severity: ErrorSeverity;
  recoveryAttempts: number;
  stackTrace?: string;
  operationDetails: {
    type: string;
    phase: string;
    duration?: number;
  };
  systemState: {
    memoryUsage: number;
    cacheSize: number;
    activeOperations: number;
  };
}

/**
 * リカバリー結果のインターフェース
 */
export interface RecoveryResult {
  success: boolean;
  attempts: number;
  duration: number;
  error?: Error;
  recoverySteps: string[];
}
