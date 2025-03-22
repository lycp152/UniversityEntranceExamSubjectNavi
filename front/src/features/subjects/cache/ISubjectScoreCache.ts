import type {
  SubjectScore,
  ScoreCalculationResult,
} from "@/types/score/score2";

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
