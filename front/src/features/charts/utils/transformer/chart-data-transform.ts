import type { SubjectScores } from '@/types/score';
import { ValidationErrorCode, ValidationSeverity } from '@/constants/validation';
import { ValidationResult } from '@/lib/validation/types';
import type { ChartData } from '@/features/charts/types/chart';
import { ScoreValidator } from '@/utils/validation/score-validator';
import { formatScore, formatPercentage } from '@/utils/formatters/chart-value-formatter';
import { SUBJECTS, SUBJECT_CATEGORIES } from '@/constants/subjects';

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
      const displayName = SUBJECTS[subject as keyof typeof SUBJECTS] || subject;
      const category = subject.replace(/[RL]$/, '');
      const color = SUBJECT_CATEGORIES[category].color || '#000000';
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
          code: ValidationErrorCode.TRANSFORM_ERROR,
          message: (error as Error).message,
          field: 'チャートデータ',
          severity: ValidationSeverity.ERROR,
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
  return Object.entries(SUBJECT_CATEGORIES).map(([category, color]) => {
    const displayName = SUBJECTS[category as keyof typeof SUBJECTS] || category;
    const value = getCategoryTotal(subjects, category);

    return createChartData(displayName, value, color.color, totalScore, category);
  });
};
