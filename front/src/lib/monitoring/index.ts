import type { Severity } from "../core";
import type { ErrorSeverity } from "@/types/errors/categories";

export type AlertCategory =
  | "performance"
  | "reliability"
  | "resources"
  | "security"
  | "availability";

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

interface BaseTrendItem {
  timestamp: number;
  value: number;
}

interface ResponseTimeTrendItem extends BaseTrendItem {
  operation: string;
}

interface ErrorRateTrendItem extends BaseTrendItem {
  errorType: string;
}

interface MemoryUsageTrendItem extends BaseTrendItem {
  type: "heap" | "rss";
}

interface CacheEfficiencyTrendItem {
  timestamp: number;
  hitRate: number;
  missRate: number;
}

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

export interface AlertHistory extends Alert {
  startTime: number;
  endTime: number;
  duration: number;
  resolutionDetails: string;
  preventiveMeasures: string[];
}

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

export interface RecoveryResult {
  success: boolean;
  attempts: number;
  duration: number;
  error?: Error;
  recoverySteps: string[];
}
