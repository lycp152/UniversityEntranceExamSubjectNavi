import { useState, useCallback } from "react";
import { SubjectScoreError, SubjectScore } from "@/types/score";
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
