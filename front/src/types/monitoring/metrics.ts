import type { Alert, AlertHistory, Priority } from "@/types/monitoring/alerts";
import type {
  ResponseTimeTrendItem,
  BaseTrendItem,
  ErrorRateTrendItem,
  MemoryUsageTrendItem,
  CacheEfficiencyTrendItem,
} from "@/types/monitoring/trends";

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
