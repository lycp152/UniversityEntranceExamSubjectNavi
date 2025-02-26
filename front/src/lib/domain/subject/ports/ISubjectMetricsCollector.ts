import type {
  SubjectScore,
  SubjectMetrics,
  CalculationResult,
} from '../../../../domain/subject/models/types';

export interface ISubjectMetricsCollector {
  collectMetrics(scores: SubjectScore[]): CalculationResult;
  getStoredMetrics(key: string): CalculationResult | undefined;
  clearMetrics(): void;
  getMetricsStats(): {
    totalEntries: number;
    oldestEntry: number;
    mostAccessed: number;
    averageProcessingTime: number;
  };
}
