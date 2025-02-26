import type { SubjectScore } from '../types/domain';

export interface ISubjectValidator {
  validateBatch(scores: SubjectScore[]): void;
  validate(score: SubjectScore): void;
}
