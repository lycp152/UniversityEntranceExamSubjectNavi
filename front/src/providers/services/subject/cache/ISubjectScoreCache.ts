import type {
  SubjectScore,
  ScoreCalculationResult,
} from "@/lib/types/score/score";

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
