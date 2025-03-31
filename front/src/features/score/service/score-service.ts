import { ScoreCalculator } from "@/features/score/utils/score-calculator";
import type { ScoreMetrics, Score } from "@/types/score";
import {
  SCORE_ERROR_CODES,
  ERROR_MESSAGES,
} from "@/constants/domain-error-codes";

export class ScoreService {
  private readonly calculator: ScoreCalculator;

  constructor() {
    this.calculator = new ScoreCalculator();
  }

  calculateSubjectScore(scores: Score[]): ScoreMetrics {
    try {
      const totalScore = this.calculator.calculateTotalScore(scores);
      const maxTotalScore = scores.reduce(
        (total, score) => total + score.maxValue,
        0
      );
      const percentage = this.calculator.calculatePercentage(
        totalScore,
        maxTotalScore
      );

      return {
        score: totalScore,
        percentage,
      };
    } catch {
      throw new Error(ERROR_MESSAGES[SCORE_ERROR_CODES.CALCULATION_ERROR]);
    }
  }

  validateScores(scores: Score[]): boolean {
    return scores.every(
      (score) => this.calculator.validateScore(score).isValid
    );
  }
}
