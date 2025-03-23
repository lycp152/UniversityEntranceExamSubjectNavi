import { useMemo } from "react";
import type { SubjectScores, SubjectScoreDetail } from "@/types/score";
import { ScoreCalculator } from "@/features/subjects/utils/calculator";
import { TEST_TYPES } from "@/types/score";

interface ScoreTableTotals {
  [TEST_TYPES.COMMON]: number;
  [TEST_TYPES.INDIVIDUAL]: number;
  total: number;
}

export const useScoreTable = (scores: SubjectScores) => {
  return useMemo(() => {
    try {
      const calculator = new ScoreCalculator();
      const calculatedScores = calculator.calculateTotalScores(scores);

      // 科目名のソート
      const sortedSubjects = Object.keys(calculatedScores).sort((a, b) =>
        a.localeCompare(b, "ja")
      );

      // 合計値の計算
      const totals = Object.values(calculatedScores).reduce<ScoreTableTotals>(
        (acc, score: SubjectScoreDetail) => ({
          [TEST_TYPES.COMMON]: acc[TEST_TYPES.COMMON] + score.commonTest.score,
          [TEST_TYPES.INDIVIDUAL]:
            acc[TEST_TYPES.INDIVIDUAL] + score.secondaryTest.score,
          total: acc.total + score.total.score,
        }),
        {
          [TEST_TYPES.COMMON]: 0,
          [TEST_TYPES.INDIVIDUAL]: 0,
          total: 0,
        }
      );

      return {
        calculatedScores,
        sortedSubjects,
        totals,
      };
    } catch (error) {
      console.error("スコアの計算中にエラーが発生しました:", error);
      return {
        calculatedScores: null,
        sortedSubjects: [],
        totals: null,
      };
    }
  }, [scores]);
};
