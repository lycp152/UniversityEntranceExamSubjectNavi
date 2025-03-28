import type { SubjectScore, ValidationResult } from "../models/types";
import { SubjectError } from "../errors/SubjectError";
import { SUBJECT_SCORE_CONSTRAINTS } from "@/constants/subject-score";

export class SubjectValidator {
  private static validateValue(value: number, maxValue: number): boolean {
    return (
      value >= SUBJECT_SCORE_CONSTRAINTS.MIN_SCORE &&
      value <= maxValue &&
      value <= SUBJECT_SCORE_CONSTRAINTS.MAX_SCORE
    );
  }

  private static validateWeight(weight: number): boolean {
    return (
      weight >= SUBJECT_SCORE_CONSTRAINTS.MIN_PERCENTAGE &&
      weight <= SUBJECT_SCORE_CONSTRAINTS.MAX_PERCENTAGE
    );
  }

  validate(score: SubjectScore): ValidationResult {
    const errors = [];
    const validatedFields = [];

    try {
      if (!SubjectValidator.validateValue(score.value, score.maxValue)) {
        errors.push({
          code: "INVALID_SCORE",
          message: "点数が有効範囲外です",
          field: "value",
          severity: "error" as const,
        });
      }
      validatedFields.push("value");

      if (!SubjectValidator.validateWeight(score.weight)) {
        errors.push({
          code: "INVALID_PERCENTAGE",
          message: "重みが有効範囲外です",
          field: "weight",
          severity: "error" as const,
        });
      }
      validatedFields.push("weight");

      return {
        isValid: errors.length === 0,
        errors,
        metadata: {
          timestamp: Date.now(),
          validatedFields,
        },
      };
    } catch (error) {
      throw SubjectError.validation("バリデーション中にエラーが発生しました", {
        error,
      });
    }
  }

  validateBatch(scores: SubjectScore[]): ValidationResult[] {
    return scores.map((score) => this.validate(score));
  }
}
