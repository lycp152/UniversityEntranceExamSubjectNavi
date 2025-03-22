import type { TestTypeName } from "@/types/university/university";
import type { SubjectName } from "@/constants/subjects";
import type { PieData } from "@/features/charts/types";

export const TEST_TYPES = {
  COMMON: "common",
  INDIVIDUAL: "individual",
} as const;

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
 * 基本スコアの型
 */
export interface BaseScore {
  value: number;
  maxValue: number;
}

/**
 * 科目スコアの型
 */
export interface SubjectScore {
  type: TestTypeName;
  value: number;
  subjectName: SubjectName;
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
  type: TestTypeName;
  code: string;
  message: string;
  subjectName: SubjectName;
}

/**
 * 科目カテゴリ
 */
export const SUBJECT_CATEGORIES = {
  ENGLISH: "英語",
  MATH: "数学",
  JAPANESE: "国語",
  SCIENCE: "理科",
  SOCIAL: "地歴公",
} as const;

export type SubjectCategory =
  (typeof SUBJECT_CATEGORIES)[keyof typeof SUBJECT_CATEGORIES];
