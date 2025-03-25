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
 * アラートのインターフェース
 */
export interface Alert {
  type: AlertType;
  message: string;
  severity: ErrorSeverity;
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
