import type { ExamTypeName, SubjectName } from "@/constants/subjects";
import type { SubjectScores } from "@/types/score";
import type { ValidationResult } from "@/types/validation-rules";

/**
 * 詳細な科目スコアの型
 */
export interface DetailedSubjectScore {
  type: ExamTypeName;
  value: number;
  maxValue: number;
  weight: number;
  subjectName: SubjectName;
  isValid: boolean;
}

/**
 * スコア計算結果の型
 */
export interface ScoreCalculationResult {
  readonly total: number;
  readonly maxTotal: number;
  readonly percentage: number;
  readonly isValid: boolean;
  readonly validationResult?: ValidationResult<SubjectScores>;
  readonly computedAt: number;
}
