import { useState, useCallback } from "react";
import type {
  SubjectScore,
  SubjectScoreError,
} from "@/types/score/SubjectScoreType";
import { validateSubjectScore } from "@/features/score/validation/SubjectScoreValidator";

export const useSubjectScore = () => {
  const [error, setError] = useState<SubjectScoreError | null>(null);

  const validateScore = useCallback((score: SubjectScore) => {
    const validationError = validateSubjectScore(score);
    setError(validationError);
    return !validationError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    validateScore,
    clearError,
  };
};
