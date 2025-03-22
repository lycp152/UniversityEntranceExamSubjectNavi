import { Priority } from "@/lib/monitoring";

export type Severity = "critical" | "warning" | "info";
export type MemoryType = "heap" | "rss";
export type Strategy = "gzip" | "base64";

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
