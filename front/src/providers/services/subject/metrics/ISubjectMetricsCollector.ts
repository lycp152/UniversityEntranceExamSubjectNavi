import type {
  SubjectScore,
  ScoreCalculationResult,
} from "@/lib/types/score/score";

export interface ISubjectMetricsCollector {
  collectMetrics(scores: SubjectScore[]): ScoreCalculationResult[];
  getStoredMetrics(key: string): ScoreCalculationResult[] | undefined;
  clearMetrics(): void;
}
