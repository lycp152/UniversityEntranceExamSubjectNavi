import type { SubjectScores } from "@/types/score";
import type { ValidationResult } from "@/types/validation";
import type { ChartData } from "@/features/charts/types/chart";
import { ScoreValidator } from "@/utils/validation/score-validator";
import {
  formatScore,
  formatPercentage,
} from "@/utils/formatters/chart-value-formatter";
import {
  SUBJECT_NAME_DISPLAY_MAPPING,
  SUBJECT_CATEGORY_COLORS,
} from "@/constants/subjects";

/**
 * 共通のチャートデータ変換関数
 */
const createChartData = (
  name: string,
  value: number,
  color: string,
  totalScore: number,
  category?: string
): ChartData => ({
  name,
  value,
  color,
  percentage: Number(formatPercentage(value / totalScore)),
  score: formatScore(value),
  ...(category && { category }),
});

/**
 * 詳細データを生成する
 */
export const transformDetailedData = async (
  subjects: SubjectScores,
  totalScore: number
): Promise<ValidationResult<ChartData[]>> => {
  try {
    const data = Object.entries(subjects).map(([subject, scores]) => {
      const displayName =
        SUBJECT_NAME_DISPLAY_MAPPING[
          subject as keyof typeof SUBJECT_NAME_DISPLAY_MAPPING
        ] || subject;
      const category = subject.replace(
        /[RL]$/,
        ""
      ) as keyof typeof SUBJECT_CATEGORY_COLORS;
      const color = SUBJECT_CATEGORY_COLORS[category] || "#000000";
      const value = scores.commonTest + scores.secondTest;

      return createChartData(displayName, value, color, totalScore, category);
    });

    const validator = new ScoreValidator();
    const result = await validator.validate(subjects);
    return {
      ...result,
      data: result.isValid ? data : undefined,
    };
  } catch (error) {
    const validator = new ScoreValidator();
    const result = await validator.validate({});
    return {
      ...result,
      data: undefined,
      errors: [
        {
          code: "VALIDATION_ERROR",
          message: (error as Error).message,
          field: "チャートデータ",
          severity: "error" as const,
        },
      ],
    };
  }
};

/**
 * 外側のチャートデータを生成する
 */
export const transformOuterData = (
  subjects: SubjectScores,
  totalScore: number,
  getCategoryTotal: (subjects: SubjectScores, category: string) => number
): ChartData[] => {
  return Object.entries(SUBJECT_CATEGORY_COLORS).map(([category, color]) => {
    const displayName =
      SUBJECT_NAME_DISPLAY_MAPPING[
        category as keyof typeof SUBJECT_NAME_DISPLAY_MAPPING
      ] || category;
    const value = getCategoryTotal(subjects, category);

    return createChartData(displayName, value, color, totalScore, category);
  });
};
