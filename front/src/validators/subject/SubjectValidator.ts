import { AdvancedValidationBuilder } from "@/features/university/domain/validators/AdvancedValidationBuilder";
import type { Score } from "@/types/subject/score";
import type { ISubjectValidator } from "./ISubjectValidator";
import { SCORE_CONSTRAINTS } from "@/lib/constants/subject/scores";
import { SubjectError } from "@/lib/errors/subject/SubjectError";

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
        message: "点数は0から最大値の間で入力してください",
        code: "INVALID_SCORE_RANGE",
      })
      .addRule({
        validate: (score) =>
          score.weight >= SCORE_CONSTRAINTS.MIN_WEIGHT &&
          score.weight <= SCORE_CONSTRAINTS.MAX_WEIGHT,
        message: "重みは0から1の間で入力してください",
        code: "INVALID_WEIGHT_RANGE",
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
