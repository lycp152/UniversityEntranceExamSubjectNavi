import type { SubjectScore, SubjectMetrics } from '../types/domain';

export interface ISubjectMetricsCollector {
  collectMetrics(scores: SubjectScore[]): SubjectMetrics[];
  getStoredMetrics(key: string): SubjectMetrics[] | undefined;
  clearMetrics(): void;
}
