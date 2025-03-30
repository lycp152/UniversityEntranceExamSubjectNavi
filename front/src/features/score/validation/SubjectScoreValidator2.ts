import { z } from 'zod';
import type { BaseSubjectScore, SubjectScores } from '@/types/score';
import { ValidationErrorCode, ValidationSeverity } from '@/constants/validation';
import type { ValidationResult } from '@/lib/validation/types';

const SCORE_CONSTRAINTS = {
  MIN_SCORE: 0,
  MAX_PERCENTAGE: 100,
} as const;

// 個別のスコアのバリデーションスキーマ
const baseSubjectScoreSchema = z.object({
  commonTest: z.number().min(SCORE_CONSTRAINTS.MIN_SCORE),
  secondTest: z.number().min(SCORE_CONSTRAINTS.MIN_SCORE),
});

// スコアの整合性チェック
export const validateScore = (score: number): boolean => {
  return score >= SCORE_CONSTRAINTS.MIN_SCORE;
};

// 科目スコアの検証
export const validateSubjectScore = (
  score: BaseSubjectScore
): ValidationResult<BaseSubjectScore> => {
  try {
    const validatedScore = baseSubjectScoreSchema.parse(score);
    const isValidCommonTest = validateScore(score.commonTest);
    const isValidSecondTest = validateScore(score.secondTest);

    if (!isValidCommonTest || !isValidSecondTest) {
      return {
        isValid: false,
        errors: [
          {
            code: ValidationErrorCode.INVALID_DATA_FORMAT,
            message: '点数が無効です',
            field: !isValidCommonTest ? 'commonTest' : 'secondTest',
            severity: ValidationSeverity.ERROR,
          },
        ],
      };
    }

    return {
      isValid: true,
      data: validatedScore,
      errors: [],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map((err: z.ZodIssue) => ({
          code: ValidationErrorCode.INVALID_DATA_FORMAT,
          message: err.message,
          field: err.path.join('.'),
          severity: ValidationSeverity.ERROR,
        })),
      };
    }
    return {
      isValid: false,
      errors: [
        {
          code: ValidationErrorCode.TRANSFORM_ERROR,
          message: '不明なエラーが発生しました',
          field: 'validation',
          severity: ValidationSeverity.ERROR,
        },
      ],
    };
  }
};

// 全科目のスコアの検証
export const validateSubjectScores = (subjects: SubjectScores): ValidationResult<SubjectScores> => {
  const errors: ValidationResult<BaseSubjectScore>['errors'] = [];
  const validatedSubjects: Partial<SubjectScores> = {};

  for (const [subject, score] of Object.entries(subjects)) {
    const result = validateSubjectScore(score);
    if (!result.isValid) {
      errors.push(
        ...result.errors.map(err => ({
          ...err,
          field: err.field ? `${subject}.${err.field}` : subject,
        }))
      );
    } else if (result.data) {
      validatedSubjects[subject as keyof SubjectScores] = result.data;
    }
  }

  return {
    isValid: errors.length === 0,
    data: errors.length === 0 ? (validatedSubjects as SubjectScores) : undefined,
    errors,
  };
};
