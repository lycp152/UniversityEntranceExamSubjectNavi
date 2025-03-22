import type { Score } from "@/types/score/score3";

export interface ISubjectValidator {
  validateBatch(scores: Score[]): void;
  validate(score: Score): void;
}
