import { SubjectScores, ScoreValidationError } from "@/types/score/score3";
import { calculatePercentage } from "@/features/score/utils/ScoreCalculation";
import { validateSubjectScores } from "@/features/score/validation/SubjectScoreValidator2";

/**
 * 各科目の詳細なスコア情報を計算する
 * @param subjects - 科目ごとのスコアデータ
 * @returns 各科目の詳細なスコア情報（得点と割合）
 * @throws {Error} バリデーションエラーが発生した場合
 * @example
 * ```ts
 * const detailedScores = calculateSubjectScores(subjects);
 *  結果例：
 *  {
 *    '英語': {
 *      commonTest: { score: 180, percentage: 90 },
 *      secondTest: { score: 90, percentage: 90 },
 *      total: { score: 270, percentage: 90 }
 *    },
 *    ...
 *  }
 */
export const calculateSubjectScores = (subjects: SubjectScores) => {
  const validationResult = validateSubjectScores(subjects);
  if (!validationResult.isValid || !validationResult.data) {
    throw new Error(
      `スコアの検証に失敗しました: ${validationResult.errors
        .map((err: ScoreValidationError) => `${err.field}: ${err.message}`)
        .join(", ")}`
    );
  }

  const validatedSubjects = validationResult.data as SubjectScores;
  const totalCommonTest = Object.values(validatedSubjects).reduce(
    (sum, score) => sum + score.commonTest,
    0
  );
  const totalSecondTest = Object.values(validatedSubjects).reduce(
    (sum, score) => sum + score.secondTest,
    0
  );

  return Object.entries(validatedSubjects).reduce(
    (acc, [subject, scores]) => {
      const { commonTest, secondTest } = scores;
      const total = commonTest + secondTest;

      acc[subject] = {
        commonTest: {
          score: commonTest,
          percentage: calculatePercentage(commonTest, totalCommonTest),
        },
        secondTest: {
          score: secondTest,
          percentage: calculatePercentage(secondTest, totalSecondTest),
        },
        total: {
          score: total,
          percentage: calculatePercentage(
            total,
            totalCommonTest + totalSecondTest
          ),
        },
      };

      return acc;
    },
    {} as Record<
      string,
      {
        commonTest: { score: number; percentage: number };
        secondTest: { score: number; percentage: number };
        total: { score: number; percentage: number };
      }
    >
  );
};
