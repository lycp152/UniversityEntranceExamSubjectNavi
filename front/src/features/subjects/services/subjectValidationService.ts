import { BaseValidator } from '@/utils/validation/base-validator';
import type { ValidationRule, ValidationResult } from '@/lib/validation/types';
import type { Subject, SubjectScore } from '@/features/subjects/schemas';
import { SUBJECT_CONSTRAINTS } from '@/features/subjects/config/constraints';
import {
  ValidationErrorCode,
  ValidationSeverity,
  ValidationCategory,
} from '@/constants/validation';

export class SubjectValidator extends BaseValidator<Subject> {
  private readonly rules: ValidationRule<Subject>[] = [
    {
      code: ValidationErrorCode.INVALID_DATA_FORMAT,
      field: 'score',
      message: 'スコアが有効範囲外です',
      condition: (subject: Subject) =>
        subject.maxScore >= SUBJECT_CONSTRAINTS.MIN_SCORE &&
        subject.minScore >= SUBJECT_CONSTRAINTS.MIN_SCORE &&
        subject.maxScore >= subject.minScore,
      severity: ValidationSeverity.ERROR,
      category: ValidationCategory.FORMAT,
    },
    {
      code: ValidationErrorCode.INVALID_DATA_FORMAT,
      field: 'weight',
      message: '重みが有効範囲外です',
      condition: (subject: Subject) =>
        subject.weight >= SUBJECT_CONSTRAINTS.MIN_WEIGHT &&
        subject.weight <= SUBJECT_CONSTRAINTS.MAX_WEIGHT,
      severity: ValidationSeverity.ERROR,
      category: ValidationCategory.FORMAT,
    },
  ];

  /**
   * スコアの検証
   */
  validateScore(score: SubjectScore): ValidationResult<SubjectScore> {
    const isValid =
      score.value >= SUBJECT_CONSTRAINTS.MIN_SCORE &&
      score.value <= score.maxValue &&
      score.weight >= SUBJECT_CONSTRAINTS.MIN_WEIGHT &&
      score.weight <= SUBJECT_CONSTRAINTS.MAX_WEIGHT;

    return {
      isValid,
      data: isValid ? score : undefined,
      errors: isValid
        ? []
        : [
            {
              code: ValidationErrorCode.INVALID_DATA_FORMAT,
              message: 'スコアが無効です',
              field: 'score',
              severity: ValidationSeverity.ERROR,
            },
          ],
      metadata: {
        validatedAt: Date.now(),
      },
    };
  }

  /**
   * 科目の検証
   */
  async validate(subject: Subject): Promise<ValidationResult<Subject>> {
    const errors = [];

    for (const rule of this.rules) {
      if (!rule.condition(subject)) {
        errors.push({
          code: rule.code,
          message: rule.message,
          field: rule.field,
          severity: ValidationSeverity.ERROR,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      data: errors.length === 0 ? subject : undefined,
      errors,
      metadata: {
        validatedAt: Date.now(),
        rules: this.rules.map(rule => rule.code),
      },
    };
  }
}
