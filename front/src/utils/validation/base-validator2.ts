import type { BaseSubjectScore, SubjectScores } from "@/types/score/score3";
import type { ValidationResult } from "@/types/validation/validation";

/**
 * スコアの有効性を確認する
 */
export const isValidScore = (score: BaseSubjectScore): boolean => {
  return score.commonTest > 0 || score.secondTest > 0;
};

/**
 * 全てのスコアが有効かどうかを確認する
 */
export const hasValidScores = (subjects: SubjectScores): boolean => {
  return Object.values(subjects).some(isValidScore);
};

/**
 * バリデーション結果を作成する
 */
export const createValidationResult = <T>(
  isValid: boolean,
  data?: T,
  errors: string[] = []
): ValidationResult<T> => {
  return {
    isValid,
    data,
    errors: errors.map((message) => ({
      code: "VALIDATION_ERROR",
      message,
      field: "数学",
      severity: "error" as const,
    })),
    metadata: {
      validatedAt: Date.now(),
      rules: [],
    },
  };
};
