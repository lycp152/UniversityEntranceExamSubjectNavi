import type {
  SubjectScore,
  ScoreCalculationResult,
} from "@/types/score/score2";

export interface ISubjectMetricsCollector {
  collectMetrics(scores: SubjectScore[]): ScoreCalculationResult[];
  getStoredMetrics(key: string): ScoreCalculationResult[] | undefined;
  clearMetrics(): void;
}
