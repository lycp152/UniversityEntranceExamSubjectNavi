import { useState, useCallback, useMemo } from "react";
import { ScoreService } from "@/lib/services/subject/score/ScoreService";
import type {
  Score,
  ScoreMetrics,
  ScoreValidationError,
} from "@/types/subject/score";

export const useScoreOperations = () => {
  const [error, setError] = useState<ScoreValidationError | null>(null);
  const scoreService = useMemo(() => new ScoreService(), []);

  const calculateScore = useCallback(
    (scores: Score[]): ScoreMetrics | null => {
      try {
        if (!scoreService.validateScores(scores)) {
          setError({
            code: "INVALID_SCORES",
            message: "無効な点数が含まれています",
          });
          return null;
        }

        const result = scoreService.calculateSubjectScore(scores);
        setError(null);
        return result;
      } catch {
        setError({
          code: "CALCULATION_ERROR",
          message: "計算中にエラーが発生しました",
        });
        return null;
      }
    },
    [scoreService]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    calculateScore,
    clearError,
  };
};
