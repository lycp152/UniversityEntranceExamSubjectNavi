import type { SubjectScore } from "@/types/score";
import type { ScoreCalculationResult } from "@/features/subjects/types/calculation";

export class SubjectMetricsCollector {
  private readonly metricsMap: Map<string, ScoreCalculationResult[]> =
    new Map();

  collectMetrics(scores: SubjectScore[]): ScoreCalculationResult[] {
    const metricsByCategory = new Map<
      string,
      { total: number; maxTotal: number }
    >();

    // カテゴリごとにスコアを集計
    scores.forEach((score) => {
      const category = score.category;
      const current = metricsByCategory.get(category) || {
        total: 0,
        maxTotal: 0,
      };

      current.total += score.value * score.weight;
      current.maxTotal += score.maxValue * score.weight;
      metricsByCategory.set(category, current);
    });

    // 最終的なメトリクスを生成
    const metrics = Array.from(metricsByCategory.values()).map((values) => ({
      total: values.total,
      maxTotal: values.maxTotal,
      percentage: (values.total / values.maxTotal) * 100,
      isValid: true,
      computedAt: Date.now(),
    }));

    this.metricsMap.set(this.generateKey(scores), metrics);
    return metrics;
  }

  getStoredMetrics(key: string): ScoreCalculationResult[] | undefined {
    return this.metricsMap.get(key);
  }

  private generateKey(scores: SubjectScore[]): string {
    return scores
      .map((s) => `${s.subjectName}:${s.value}:${s.type}`)
      .sort((a, b) => a.localeCompare(b, "ja"))
      .join("|");
  }

  clearMetrics(): void {
    this.metricsMap.clear();
  }
}
