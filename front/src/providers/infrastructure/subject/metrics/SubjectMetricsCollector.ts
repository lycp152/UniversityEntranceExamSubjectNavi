import type {
  SubjectScore,
  SubjectMetrics,
  CalculationResult,
} from "@/lib/domain/subject/models/types";
import type { ISubjectMetricsCollector } from "@/lib/domain/subject/ports/ISubjectMetricsCollector";
import { SubjectError } from "@/lib/domain/subject/errors/SubjectError";
import { Subject } from "@/lib/domain/subject/models/Subject";

interface MetricsEntry {
  metrics: SubjectMetrics[];
  timestamp: number;
  accessCount: number;
  processingTime: number;
}

export class SubjectMetricsCollector implements ISubjectMetricsCollector {
  private readonly metricsMap: Map<string, MetricsEntry> = new Map();
  private readonly maxEntries: number = 1000;
  private readonly entryTTL: number = 1000 * 60 * 60; // 1時間

  collectMetrics(scores: SubjectScore[]): CalculationResult {
    const startTime = performance.now();
    try {
      const metricsByCategory = new Map<string, SubjectMetrics>();
      const subjects = scores.map((score) => Subject.create(score));

      subjects.forEach((subject) => {
        const category = subject.category;
        const metrics = subject.toMetrics();
        const current = metricsByCategory.get(category);

        if (current) {
          metricsByCategory.set(category, {
            score: current.score + metrics.score,
            percentage: (current.score + metrics.score) / subjects.length,
            category: metrics.category,
            timestamp: Date.now(),
          });
        } else {
          metricsByCategory.set(category, metrics);
        }
      });

      const metrics = Array.from(metricsByCategory.values());
      const key = this.generateKey(scores);
      const processingTime = performance.now() - startTime;

      this.metricsMap.set(key, {
        metrics,
        timestamp: Date.now(),
        accessCount: 0,
        processingTime,
      });

      this.cleanup();
      return {
        metrics,
        timestamp: Date.now(),
        metadata: {
          processingTime,
          cacheHit: false,
          calculationMethod: "standard",
        },
      };
    } catch (error) {
      throw SubjectError.metrics("メトリクス計算中にエラーが発生しました", {
        error,
      });
    }
  }

  getStoredMetrics(key: string): CalculationResult | undefined {
    const entry = this.metricsMap.get(key);
    if (!entry) return undefined;

    entry.accessCount++;
    return {
      metrics: entry.metrics,
      timestamp: Date.now(),
      metadata: {
        processingTime: entry.processingTime,
        cacheHit: true,
        calculationMethod: "cached",
      },
    };
  }

  private generateKey(scores: SubjectScore[]): string {
    return scores
      .map((s) => `${s.subjectName}:${s.value}:${s.type}`)
      .sort((a, b) => a.localeCompare(b, "ja"))
      .join("|");
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.metricsMap.entries()) {
      if (now - entry.timestamp > this.entryTTL) {
        this.metricsMap.delete(key);
      }
    }

    if (this.metricsMap.size > this.maxEntries) {
      const entries = Array.from(this.metricsMap.entries())
        .sort(([, a], [, b]) => b.accessCount - a.accessCount)
        .slice(0, this.maxEntries);

      this.metricsMap.clear();
      entries.forEach(([key, value]) => this.metricsMap.set(key, value));
    }
  }

  clearMetrics(): void {
    this.metricsMap.clear();
  }

  getMetricsStats(): {
    totalEntries: number;
    oldestEntry: number;
    mostAccessed: number;
    averageProcessingTime: number;
  } {
    const entries = Array.from(this.metricsMap.values());
    const totalProcessingTime = entries.reduce(
      (sum, entry) => sum + entry.processingTime,
      0
    );

    return {
      totalEntries: this.metricsMap.size,
      oldestEntry: Math.min(...entries.map((e) => e.timestamp)),
      mostAccessed: Math.max(...entries.map((e) => e.accessCount)),
      averageProcessingTime: totalProcessingTime / (entries.length || 1),
    };
  }
}
