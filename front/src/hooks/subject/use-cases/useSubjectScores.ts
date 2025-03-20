import { useState, useCallback } from "react";
import type {
  SubjectScore,
  SubjectMetrics,
  SubjectValidationError,
} from "@/types/subject/domain";
import type { Score } from "@/types/subject/score";
import { ScoreServiceFactory } from "@/lib/factories/subject/ScoreServiceFactory";

interface UseSubjectScoresResult {
  scores: SubjectScore[];
  metrics: SubjectMetrics[];
  error: SubjectValidationError | null;
  addScore: (score: SubjectScore) => void;
  updateScore: (index: number, score: SubjectScore) => void;
  removeScore: (index: number) => void;
  calculateMetrics: () => void;
  clearError: () => void;
}

const convertToScore = (subjectScore: SubjectScore): Score => ({
  value: subjectScore.value,
  maxValue: subjectScore.maxValue,
  weight: subjectScore.weight,
  type: subjectScore.type,
  subjectName: subjectScore.subjectName,
  percentage: 0, // 初期値として0を設定
});

export const useSubjectScores = (): UseSubjectScoresResult => {
  const [scores, setScores] = useState<SubjectScore[]>([]);
  const [metrics, setMetrics] = useState<SubjectMetrics[]>([]);
  const [error, setError] = useState<SubjectValidationError | null>(null);
  const scoreService = ScoreServiceFactory.createService();

  const addScore = useCallback((score: SubjectScore) => {
    setScores((prev) => [...prev, score]);
  }, []);

  const updateScore = useCallback((index: number, score: SubjectScore) => {
    setScores((prev) => {
      const newScores = [...prev];
      newScores[index] = score;
      return newScores;
    });
  }, []);

  const removeScore = useCallback((index: number) => {
    setScores((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const calculateMetrics = useCallback(() => {
    try {
      const result = scoreService.calculateSubjectScore(
        scores.map(convertToScore)
      );
      setMetrics([
        {
          score: result.score,
          percentage: result.percentage,
          category: scores[0]?.category || "未分類",
        },
      ]);
      setError(null);
    } catch {
      setError({
        code: "CALCULATION_ERROR",
        message: "計算中にエラーが発生しました",
        field: "scores",
        severity: "error",
      });
    }
  }, [scores, scoreService]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    scores,
    metrics,
    error,
    addScore,
    updateScore,
    removeScore,
    calculateMetrics,
    clearError,
  };
};
