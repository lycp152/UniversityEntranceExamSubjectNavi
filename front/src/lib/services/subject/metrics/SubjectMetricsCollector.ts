import type { SubjectScore, SubjectMetrics } from '../types/domain';

export class SubjectMetricsCollector {
  private readonly metricsMap: Map<string, SubjectMetrics[]> = new Map();

  collectMetrics(scores: SubjectScore[]): SubjectMetrics[] {
    const metricsByCategory = new Map<string, SubjectMetrics>();

    // カテゴリごとにスコアを集計
    scores.forEach((score) => {
      const category = score.category;
      const current = metricsByCategory.get(category) || {
        score: 0,
        percentage: 0,
        category,
      };

      current.score += score.value * score.weight;
      current.percentage = (current.score / score.maxValue) * 100;
      metricsByCategory.set(category, current);
    });

    const metrics = Array.from(metricsByCategory.values());
    this.metricsMap.set(this.generateKey(scores), metrics);
    return metrics;
  }

  getStoredMetrics(key: string): SubjectMetrics[] | undefined {
    return this.metricsMap.get(key);
  }

  private generateKey(scores: SubjectScore[]): string {
    return scores
      .map((s) => `${s.subjectName}:${s.value}:${s.type}`)
      .sort((a, b) => a.localeCompare(b, 'ja'))
      .join('|');
  }

  clearMetrics(): void {
    this.metricsMap.clear();
  }
}
