import { BaseValidator } from "@/utils/validation/base-validator";
import type { ValidationRule, ValidationResult } from "@/types/validation";
import type { Subject, SubjectScore } from "@/features/subjects/schemas";
import { SUBJECT_CONSTRAINTS } from "@/features/subjects/config/constraints";

export class SubjectValidator extends BaseValidator<Subject> {
  private readonly rules: ValidationRule<Subject>[] = [
    {
      code: "VALID_SCORE_RANGE",
      name: "スコア範囲の検証",
      message: "スコアが有効範囲外です",
      validate: (subject) =>
        subject.maxScore >= SUBJECT_CONSTRAINTS.MIN_SCORE &&
        subject.minScore >= SUBJECT_CONSTRAINTS.MIN_SCORE &&
        subject.maxScore >= subject.minScore,
      severity: "error",
      category: "validation",
    },
    {
      code: "VALID_WEIGHT",
      name: "重みの検証",
      message: "重みが有効範囲外です",
      validate: (subject) =>
        subject.weight >= SUBJECT_CONSTRAINTS.MIN_WEIGHT &&
        subject.weight <= SUBJECT_CONSTRAINTS.MAX_WEIGHT,
      severity: "error",
      category: "validation",
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
              code: "INVALID_SCORE",
              message: "スコアが無効です",
              severity: "error" as const,
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
      if (!(await rule.validate(subject))) {
        errors.push({
          code: rule.code,
          message: rule.message,
          severity: "error" as const,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      data: errors.length === 0 ? subject : undefined,
      errors,
      metadata: {
        validatedAt: Date.now(),
        rules: this.rules.map((rule) => rule.code),
      },
    };
  }
}
