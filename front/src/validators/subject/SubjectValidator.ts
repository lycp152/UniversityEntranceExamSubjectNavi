import { AdvancedValidationBuilder } from "@/components/features/university/domain/validators/AdvancedValidationBuilder";
import type { SubjectScore } from "../types/domain";
import type { ISubjectValidator } from "./ISubjectValidator";
import { SCORE_CONSTRAINTS } from "../../constants/subject/scores";
import { SubjectError } from "../../errors/subject/SubjectError";

export class SubjectValidator implements ISubjectValidator {
  private readonly builder: AdvancedValidationBuilder<SubjectScore>;

  constructor() {
    this.builder = new AdvancedValidationBuilder<SubjectScore>(
      "subject-validation"
    );
    this.setupValidationRules();
  }

  private setupValidationRules(): void {
    this.builder
      .addRule({
        validate: (score) =>
          score.value >= SCORE_CONSTRAINTS.MIN_VALUE &&
          score.value <= score.maxValue,
        message: "点数は0から最大値の間で入力してください",
        field: "value",
      })
      .addRule({
        validate: (score) =>
          score.weight >= SCORE_CONSTRAINTS.MIN_WEIGHT &&
          score.weight <= SCORE_CONSTRAINTS.MAX_WEIGHT,
        message: "重みは0から1の間で入力してください",
        field: "weight",
      });
  }

  validate(score: SubjectScore): void {
    try {
      this.builder.validate(score);
    } catch (error) {
      if (error instanceof Error) {
        throw SubjectError.validation(error.message);
      }
      throw SubjectError.validation("不明なバリデーションエラーが発生しました");
    }
  }

  validateBatch(scores: SubjectScore[]): void {
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
