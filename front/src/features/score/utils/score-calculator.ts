import type { Score } from '@/types/score';
import type { ValidationResult } from '@/lib/validation/types';
import { ValidationErrorCode, ValidationSeverity } from '@/lib/validation/constants';

export class ScoreCalculator {
  calculateTotalScore(scores: Score[]): number {
    return scores.reduce((total, score) => total + score.value * score.weight, 0);
  }

  calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return (value / total) * 100;
  }

  calculateWeightedScore(score: Score): number {
    return score.value * score.weight;
  }

  validateScore(score: Score): ValidationResult<Score> {
    const isValid = score.value >= 0 && score.value <= score.maxValue && score.weight > 0;

    return {
      isValid,
      data: isValid ? score : undefined,
      errors: isValid
        ? []
        : [
            {
              code: ValidationErrorCode.INVALID_DATA_FORMAT,
              message: '点数が有効範囲外です',
              field: 'value',
              severity: ValidationSeverity.ERROR,
            },
          ],
      metadata: {
        validatedAt: Date.now(),
      },
    };
  }
}
