import type { SubjectScore } from "@/types/score";
import type { ScoreCalculationResult } from "@/features/subjects/types/calculation";

export interface ISubjectScoreCache {
  get(
    key: string
  ): { scores: SubjectScore[]; metrics: ScoreCalculationResult[] } | null;
  set(
    key: string,
    scores: SubjectScore[],
    metrics: ScoreCalculationResult[]
  ): void;
  clear(): void;
}
