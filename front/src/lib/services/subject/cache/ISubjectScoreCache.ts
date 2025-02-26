import type { SubjectScore, SubjectMetrics } from "../types/domain";

export interface ISubjectScoreCache {
  get(
    key: string
  ): { scores: SubjectScore[]; metrics: SubjectMetrics[] } | null;
  set(key: string, scores: SubjectScore[], metrics: SubjectMetrics[]): void;
  clear(): void;
}
