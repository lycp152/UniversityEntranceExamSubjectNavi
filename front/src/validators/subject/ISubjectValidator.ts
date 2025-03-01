import type { Score } from "@/types/subject/score";

export interface ISubjectValidator {
  validateBatch(scores: Score[]): void;
  validate(score: Score): void;
}
