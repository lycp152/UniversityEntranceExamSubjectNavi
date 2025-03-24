import type { TestTypeName } from "@/types/universities/university";
import type { SubjectName } from "@/types/subjects";
import type { SubjectScores } from "@/types/score";
import type { ValidationResult } from "@/types/validation";

/**
 * 詳細な科目スコアの型
 */
export interface DetailedSubjectScore {
  type: TestTypeName;
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
