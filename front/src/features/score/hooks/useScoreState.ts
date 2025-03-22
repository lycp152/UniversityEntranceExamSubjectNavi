import { useState, useCallback, useMemo } from "react";
import type { ScoreMetrics } from "@/types/score/score";
import type { Score, ScoreValidationError } from "@/types/score/core";
import type { CategoryScore } from "@/types/score/display";
import { validateScore } from "@/features/score/validation/scoreValidator2";
import { ScoreAggregator } from "@/features/subjects/utils/scoreAggregator";

interface ScoreState {
  scores: Score[];
  metrics: ScoreMetrics | null;
  error: ScoreValidationError | null;
}

export const useScoreState = () => {
  const [state, setState] = useState<ScoreState>({
    scores: [],
    metrics: null,
    error: null,
  });

  const aggregator = useMemo(() => new ScoreAggregator(), []);

  const calculateTotalMetrics = useCallback(
    (categoryScores: CategoryScore[]): ScoreMetrics => {
      return categoryScores.reduce(
        (total, category) => ({
          score: total.score + category.total.score,
          percentage: total.percentage + category.total.percentage,
        }),
        { score: 0, percentage: 0 }
      );
    },
    []
  );

  const updateScore = useCallback(
    (newScore: Score) => {
      const validation = validateScore(newScore);
      if (!validation.isValid) {
        setState((prev) => ({
          ...prev,
          error: {
            code: validation.errors[0].code,
            message: validation.errors[0].message,
            field: newScore.subjectName,
          },
        }));
        return;
      }

      setState((prev) => {
        const scores = [...prev.scores];
        const index = scores.findIndex(
          (s) =>
            s.subjectName === newScore.subjectName && s.type === newScore.type
        );

        if (index >= 0) {
          scores[index] = newScore;
        } else {
          scores.push(newScore);
        }

        const categoryScores = aggregator.aggregateByCategory(scores);
        const totalMetrics = calculateTotalMetrics(categoryScores);

        return {
          scores,
          metrics: totalMetrics,
          error: null,
        };
      });
    },
    [aggregator, calculateTotalMetrics]
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const categoryScores = useMemo(() => {
    return aggregator.aggregateByCategory(state.scores);
  }, [state.scores, aggregator]);

  return {
    scores: state.scores,
    metrics: state.metrics,
    error: state.error,
    categoryScores,
    updateScore,
    clearError,
  };
};
