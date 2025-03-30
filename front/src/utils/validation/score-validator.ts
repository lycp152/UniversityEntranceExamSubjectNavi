import type { BaseSubjectScore, SubjectScores } from '@/types/score';
import { ValidationErrorCode, ValidationSeverity } from '@/constants/validation';
import type { ValidationResult } from '@/lib/validation/types';
import { BaseValidator } from './base-validator';

/**
 * スコアの有効性を確認する
 */
export const isValidScore = (score: BaseSubjectScore): boolean => {
  return score.commonTest > 0 || score.secondTest > 0;
};

/**
 * 全てのスコアが有効かどうかを確認する
 */
const hasValidScores = (subjects: SubjectScores): boolean => {
  return Object.values(subjects).some(isValidScore);
};

/**
 * スコアバリデーションクラス
 */
export class ScoreValidator extends BaseValidator<SubjectScores> {
  async validate(data: unknown): Promise<ValidationResult<SubjectScores>> {
    const subjects = data as SubjectScores;
    const isValid = hasValidScores(subjects);

    return {
      isValid,
      data: isValid ? subjects : undefined,
      errors: isValid
        ? []
        : [
            {
              code: ValidationErrorCode.INVALID_DATA_FORMAT,
              message: 'スコアが無効です',
              field: 'スコア',
              severity: ValidationSeverity.ERROR,
            },
          ],
      metadata: {
        validatedAt: Date.now(),
        rules: ['score-validation'],
      },
    };
  }
}
