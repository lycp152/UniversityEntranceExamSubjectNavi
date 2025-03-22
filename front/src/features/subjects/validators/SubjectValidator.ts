import type { SubjectScore, ValidationResult } from "../models/types";
import { SubjectError } from "../errors/SubjectError";
import { SCORE_CONSTRAINTS } from "@/constants/scores";

export class SubjectValidator {
  private static validateValue(value: number, maxValue: number): boolean {
    return (
      value >= SCORE_CONSTRAINTS.MIN_VALUE &&
      value <= maxValue &&
      value <= SCORE_CONSTRAINTS.MAX_VALUE
    );
  }

  private static validateWeight(weight: number): boolean {
    return (
      weight >= SCORE_CONSTRAINTS.MIN_WEIGHT &&
      weight <= SCORE_CONSTRAINTS.MAX_WEIGHT
    );
  }

  validate(score: SubjectScore): ValidationResult {
    const errors = [];
    const validatedFields = [];

    try {
      if (!SubjectValidator.validateValue(score.value, score.maxValue)) {
        errors.push({
          code: "INVALID_VALUE",
          message: "点数が有効範囲外です",
          field: "value",
          severity: "error" as const,
        });
      }
      validatedFields.push("value");

      if (!SubjectValidator.validateWeight(score.weight)) {
        errors.push({
          code: "INVALID_WEIGHT",
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
