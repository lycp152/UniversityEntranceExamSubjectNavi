import type {
  SubjectScore,
  SubjectMetrics,
} from "@/features/subjects/models/types";

export interface ISubjectScoreCache {
  get(
    key: string
  ): { scores: SubjectScore[]; metrics: SubjectMetrics[] } | null;
  set(key: string, scores: SubjectScore[], metrics: SubjectMetrics[]): void;
  clear(): void;
  getStats(): {
    hits: number;
    misses: number;
    totalOperations: number;
    averageAccessTime: number;
  };
}
