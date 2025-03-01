import type { Score } from "@/types/subject/score";
import type { ValidationResult } from "@/types/validation";
import { SCORE_CONSTRAINTS } from "@/lib/constants/subject/scores";

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
      score.value >= SCORE_CONSTRAINTS.MIN_VALUE &&
      score.value <= score.maxValue &&
      score.weight > 0;

    return {
      isValid,
      data: isValid ? score : undefined,
      errors: isValid
        ? []
        : [
            {
              code: "INVALID_SCORE",
              message: "点数が有効範囲外です",
            },
          ],
      metadata: {
        validatedAt: Date.now(),
      },
    };
  }
}
