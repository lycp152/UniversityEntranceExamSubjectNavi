import { AdvancedValidationBuilder } from "@/features/subjects/validators/AdvancedValidationBuilder";
import type { Score } from "@/types/score";
import type { ISubjectValidator } from "./ISubjectValidator";
import { SCORE_CONSTRAINTS } from "@/constants/scores";
import { SubjectError } from "@/features/subjects/errors/SubjectError";

export class SubjectValidator implements ISubjectValidator {
  private readonly builder: AdvancedValidationBuilder<Score>;

  constructor() {
    this.builder = new AdvancedValidationBuilder<Score>("subject-validation");
    this.setupValidationRules();
  }

  private setupValidationRules(): void {
    this.builder
      .addRule({
        validate: (score) =>
          score.value >= SCORE_CONSTRAINTS.MIN_VALUE &&
          score.value <= score.maxValue,
        message: "スコアが範囲外です",
        code: "INVALID_SCORE_RANGE",
        name: "INVALID_SCORE_RANGE",
        severity: "error",
        category: "validation",
      })
      .addRule({
        validate: (score) => score.maxValue > 0,
        message: "最大値は0より大きい必要があります",
        code: "INVALID_MAX_VALUE",
        name: "INVALID_MAX_VALUE",
        severity: "error",
        category: "validation",
      })
      .addRule({
        validate: (score) =>
          score.weight >= SCORE_CONSTRAINTS.MIN_WEIGHT &&
          score.weight <= SCORE_CONSTRAINTS.MAX_WEIGHT,
        message: "重みは0から1の間で入力してください",
        code: "INVALID_WEIGHT_RANGE",
        name: "INVALID_WEIGHT_RANGE",
        severity: "error",
        category: "validation",
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
