import { AdvancedValidationBuilder } from "@/features/subjects/validators/AdvancedValidationBuilder";
import type { Score } from "@/types/score";
import type { ISubjectValidator } from "./ISubjectValidator";
import { SubjectError } from "@/features/subjects/errors/SubjectError";
import { SUBJECT_SCORE_CONSTRAINTS } from "@/constants/subject-score-constraints";

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
          score.value >= SUBJECT_SCORE_CONSTRAINTS.MIN_SCORE &&
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
        code: "INVALID_MAX_SCORE",
        name: "INVALID_MAX_SCORE",
        severity: "error",
        category: "validation",
      })
      .addRule({
        validate: (score) =>
          score.weight >= SUBJECT_SCORE_CONSTRAINTS.MIN_PERCENTAGE &&
          score.weight <= SUBJECT_SCORE_CONSTRAINTS.MAX_PERCENTAGE,
        message: "重みは0から1の間で入力してください",
        code: "INVALID_PERCENTAGE_RANGE",
        name: "INVALID_PERCENTAGE_RANGE",
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
