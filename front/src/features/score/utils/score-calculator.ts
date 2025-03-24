import type { Score } from "@/types/score";
import type { ValidationResult } from "@/types/validation";
import { SCORE_ERROR_CODES } from "@/constants/domain-error-codes";

export class ScoreCalculator {
  calculateTotalScore(scores: Score[]): number {
    return scores.reduce(
      (total, score) => total + score.value * score.weight,
      0
    );
  }

  calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return (value / total) * 100;
  }

  calculateWeightedScore(score: Score): number {
    return score.value * score.weight;
  }

  validateScore(score: Score): ValidationResult<Score> {
    const isValid =
      score.value >= 0 && score.value <= score.maxValue && score.weight > 0;

    return {
      isValid,
      data: isValid ? score : undefined,
      errors: isValid
        ? []
        : [
            {
              code: SCORE_ERROR_CODES.INVALID_SCORE,
              message: "点数が有効範囲外です",
              field: "value",
              severity: "error",
            },
          ],
      metadata: {
        validatedAt: Date.now(),
      },
    };
  }
}
