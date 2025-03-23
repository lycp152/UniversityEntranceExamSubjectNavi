import type { Score } from "@/types/score";

export interface ISubjectValidator {
  validateBatch(scores: Score[]): void;
  validate(score: Score): void;
}
