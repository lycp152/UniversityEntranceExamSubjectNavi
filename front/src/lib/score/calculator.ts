import type { SubjectScores } from "@/lib/types/score";
import { TEST_TYPES } from "@/lib/types/score";

export class ScoreCalculator {
  calculateTotalScores(scores: SubjectScores) {
    const result: Record<
      string,
      {
        [TEST_TYPES.COMMON]: { score: number; percentage: number };
        [TEST_TYPES.INDIVIDUAL]: { score: number; percentage: number };
        total: { score: number; percentage: number };
      }
    > = {};

    Object.entries(scores).forEach(([subject, subjectScores]) => {
      result[subject] = {
        [TEST_TYPES.COMMON]: {
          score: subjectScores[TEST_TYPES.COMMON]?.score || 0,
          percentage: subjectScores[TEST_TYPES.COMMON]?.percentage || 0,
        },
        [TEST_TYPES.INDIVIDUAL]: {
          score: subjectScores[TEST_TYPES.INDIVIDUAL]?.score || 0,
          percentage: subjectScores[TEST_TYPES.INDIVIDUAL]?.percentage || 0,
        },
        total: {
          score:
            (subjectScores[TEST_TYPES.COMMON]?.score || 0) +
            (subjectScores[TEST_TYPES.INDIVIDUAL]?.score || 0),
          percentage:
            (subjectScores[TEST_TYPES.COMMON]?.percentage || 0) +
            (subjectScores[TEST_TYPES.INDIVIDUAL]?.percentage || 0),
        },
      };
    });

    return result;
  }
}
