import type { ExamTypeName, SubjectCategory } from "@/constants/subjects";
import type { SubjectName } from "@/types/subjects";
import type { PieData } from "@/types/charts/pie-chart";

export interface BaseScore {
  value: number;
  maxValue: number;
  weight: number;
}

export interface SubjectScore extends BaseScore {
  type: ExamTypeName;
  subjectName: SubjectName;
  category: SubjectCategory;
}

export interface SubjectMetrics {
  score: number;
  percentage: number;
  category: SubjectCategory;
}

export interface SubjectValidationError {
  code: string;
  message: string;
  field: string;
  severity: "error" | "warning" | "info";
}
export interface Score {
  value: number;
  maxValue: number;
  weight: number;
  type: ExamTypeName;
  subjectName: SubjectName;
  percentage: number;
}

export interface ScoreValidationError {
  code: string;
  message: string;
  field?: string;
}

export type TestType = (typeof TEST_TYPES)[keyof typeof TEST_TYPES];

export const SCORE_CONSTRAINTS = {
  MIN_VALUE: 0,
  MAX_VALUE: 100,
  MIN_WEIGHT: 0,
  MAX_WEIGHT: 1,
} as const;

/**
 * テストスコアの基本型
 */
export interface TestScore {
  readonly value: number;
  readonly maxValue: number;
}

/**
 * スコアメトリクスの基本型
 */
export interface ScoreMetrics {
  score: number;
  percentage: number;
}

/**
 * 基本科目スコアの型
 */
export interface BaseSubjectScore {
  commonTest: number;
  secondTest: number;
}

/**
 * 科目スコアの型
 */
export interface SubjectScores {
  [subject: string]: BaseSubjectScore;
}

/**
 * 科目スコアの詳細型
 */
export interface SubjectScoreDetail {
  subject: string;
  commonTest: ScoreMetrics;
  secondaryTest: ScoreMetrics;
  total: ScoreMetrics;
}

/**
 * 科目スコアの表示用型
 */
export interface DisplaySubjectScore extends PieData {
  percentage: number;
  category: string;
  displayName?: string;
}

/**
 * 科目スコアのエラー型
 */
export interface SubjectScoreError {
  type: ExamTypeName;
  code: string;
  message: string;
  subjectName: SubjectName;
}

export const TEST_TYPES = {
  COMMON: "common",
  INDIVIDUAL: "individual",
} as const;
