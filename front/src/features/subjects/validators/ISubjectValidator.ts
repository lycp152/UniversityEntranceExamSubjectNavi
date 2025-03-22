import type { Score } from "@/types/score/core";

export interface ISubjectValidator {
  validateBatch(scores: Score[]): void;
  validate(score: Score): void;
}
