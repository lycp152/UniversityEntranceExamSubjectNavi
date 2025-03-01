import type { Score } from "@/types/subject/score";
import type { ValidationResult } from "@/types/validation";
import {
  SCORE_CONSTRAINTS,
  SCORE_ERROR_CODES,
  SCORE_ERROR_MESSAGES,
} from "@/lib/constants/subject/scores";

export const validateScore = (score: Score): ValidationResult<Score> => {
  const errors = [];

  if (
    score.value < SCORE_CONSTRAINTS.MIN_VALUE ||
    score.value > score.maxValue
  ) {
    errors.push({
      code: SCORE_ERROR_CODES.INVALID_RANGE,
      message: SCORE_ERROR_MESSAGES[SCORE_ERROR_CODES.INVALID_RANGE],
    });
  }

  if (
    score.weight < SCORE_CONSTRAINTS.MIN_WEIGHT ||
    score.weight > SCORE_CONSTRAINTS.MAX_WEIGHT
  ) {
    errors.push({
      code: SCORE_ERROR_CODES.INVALID_WEIGHT,
      message: SCORE_ERROR_MESSAGES[SCORE_ERROR_CODES.INVALID_WEIGHT],
    });
  }

  return {
    isValid: errors.length === 0,
    data: errors.length === 0 ? score : undefined,
    errors,
    metadata: {
      validatedAt: Date.now(),
    },
  };
};

export const validateScores = (scores: Score[]): boolean => {
  return scores.every((score) => validateScore(score).isValid);
};
