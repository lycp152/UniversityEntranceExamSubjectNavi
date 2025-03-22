import type { SubjectScore } from "@/types/score/score";
import type { ScoreCalculationResult } from "@/features/subjects/types/calculation";

export interface ISubjectMetricsCollector {
  collectMetrics(scores: SubjectScore[]): ScoreCalculationResult[];
  getStoredMetrics(key: string): ScoreCalculationResult[] | undefined;
  clearMetrics(): void;
}
