import { AdvancedValidationBuilder } from "@/features/subjects/validators/AdvancedValidationBuilder";
import type { Score } from "@/types/score";
import type { ISubjectValidator } from "./ISubjectValidator";
import { SubjectError } from "@/features/subjects/errors/SubjectError";
import { SUBJECT_SCORE_CONSTRAINTS } from "@/constants/subject-score";
import {
  ValidationErrorCode,
  ValidationSeverity,
  ValidationCategory,
} from "@/constants/validation";

export class SubjectValidator implements ISubjectValidator {
  private readonly builder: AdvancedValidationBuilder<Score>;

  constructor() {
    this.builder = new AdvancedValidationBuilder<Score>("subject-validation");
    this.setupValidationRules();
  }

  private setupValidationRules(): void {
    this.builder
      .addRule({
        condition: (score: Score) =>
          score.value >= SUBJECT_SCORE_CONSTRAINTS.MIN_SCORE &&
          score.value <= score.maxValue,
        message: "スコアが範囲外です",
        code: ValidationErrorCode.INVALID_DATA_FORMAT,
        severity: ValidationSeverity.ERROR,
        category: ValidationCategory.FORMAT,
        field: "value",
      })
      .addRule({
        condition: (score: Score) => score.maxValue > 0,
        message: "最大値は0より大きい必要があります",
        code: ValidationErrorCode.INVALID_DATA_FORMAT,
        severity: ValidationSeverity.ERROR,
        category: ValidationCategory.FORMAT,
        field: "maxValue",
      })
      .addRule({
        condition: (score: Score) =>
          score.weight >= SUBJECT_SCORE_CONSTRAINTS.MIN_PERCENTAGE &&
          score.weight <= SUBJECT_SCORE_CONSTRAINTS.MAX_PERCENTAGE,
        message: "重みは0から1の間で入力してください",
        code: ValidationErrorCode.INVALID_PERCENTAGE,
        severity: ValidationSeverity.ERROR,
        category: ValidationCategory.FORMAT,
        field: "weight",
      });
  }

  validate(score: Score): void {
    try {
      this.builder.validate(score);
    } catch (error) {
      if (error instanceof Error) {
        throw SubjectError.validation(error.message);
      }
      throw SubjectError.validation("不明なバリデーションエラーが発生しました");
    }
  }

  validateBatch(scores: Score[]): void {
    scores.forEach((score, index) => {
      try {
        this.validate(score);
      } catch (error) {
        if (error instanceof SubjectError) {
          throw SubjectError.validation(
            `スコア[${index}]のバリデーションエラー: ${error.message}`,
            { index, score }
          );
        }
        throw error;
      }
    });
  }
}
