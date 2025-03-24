import type { Score } from "@/types/score";
import type { ValidationResult } from "@/types/validation";
import {
  SCORE_ERROR_CODES,
  ERROR_MESSAGES,
} from "@/constants/domain-error-codes";
import { SUBJECT_SCORE_CONSTRAINTS } from "@/constants/subject-score-constraints";

type ValidationSeverity = "error" | "warning" | "info";

export const validateScore = (score: Score): ValidationResult<Score> => {
  const errors = [];

  if (
    score.value < SUBJECT_SCORE_CONSTRAINTS.MIN_SCORE ||
    score.value > score.maxValue
  ) {
    errors.push({
      code: SCORE_ERROR_CODES.INVALID_RANGE,
      message: ERROR_MESSAGES[SCORE_ERROR_CODES.INVALID_RANGE],
      field: "value",
      severity: "error" as ValidationSeverity,
    });
  }

  if (
    score.weight < SUBJECT_SCORE_CONSTRAINTS.MIN_PERCENTAGE ||
    score.weight > SUBJECT_SCORE_CONSTRAINTS.MAX_PERCENTAGE
  ) {
    errors.push({
      code: SCORE_ERROR_CODES.INVALID_WEIGHT,
      message: ERROR_MESSAGES[SCORE_ERROR_CODES.INVALID_WEIGHT],
      field: "weight",
      severity: "error" as ValidationSeverity,
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
