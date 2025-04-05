/**
 * スコア関連の型定義
 * スコアの計算、検証、表示に関する型定義を管理
 *
 * @module score
 * @description
 * - 基本スコアの型定義
 * - 科目スコアの型定義
 * - スコアメトリクスの型定義
 * - スコア検証の型定義
 * - スコア表示の型定義
 */

import type { SubjectCategory } from '@/constants/constraint/subject-categories';
import type { SubjectName } from '@/constants/constraint/subjects';
import type { ExamTypeName } from '@/constants/constraint/exam-types';
import type { PieData } from '@/types/pie-chart';

/** 基本スコアの型 */
export interface BaseScore {
  /** スコアの実際の値 */
  value: number;
  /** スコアの最大可能値 */
  maxValue: number;
  /** スコアの重み（0から1の間の値） */
  weight: number;
}

/** 科目スコアの型 */
export interface SubjectScore extends BaseScore {
  /** 試験種別 */
  type: ExamTypeName;
  /** 科目名 */
  subjectName: SubjectName;
  /** 科目カテゴリ */
  category: SubjectCategory;
}

/** 科目メトリクスの型 */
export interface SubjectMetrics {
  /** スコア */
  score: number;
  /** パーセンテージ */
  percentage: number;
  /** 科目カテゴリ */
  category: SubjectCategory;
}

/** 科目検証エラーの型 */
export interface SubjectValidationError {
  /** エラーコード */
  code: string;
  /** エラーメッセージ */
  message: string;
  /** エラーが発生したフィールド */
  field: string;
  /** エラーの重要度 */
  severity: 'error' | 'warning' | 'info';
}

/** スコアの型 */
export interface Score {
  /** スコア値 */
  value: number;
  /** 最大値 */
  maxValue: number;
  /** 重み */
  weight: number;
  /** 試験種別 */
  type: ExamTypeName;
  /** 科目名 */
  subjectName: SubjectName;
  /** パーセンテージ */
  percentage: number;
}

/** スコア検証エラーの型 */
export interface ScoreValidationError {
  /** エラーコード */
  code: string;
  /** エラーメッセージ */
  message: string;
  /** エラーが発生したフィールド */
  field?: string;
}

/** テスト種別の型 */
export type TestType = (typeof TEST_TYPES)[keyof typeof TEST_TYPES];

/** スコアの制約値 */
export const SCORE_CONSTRAINTS = {
  /** 最小値 */
  MIN_VALUE: 0,
  /** 最大値 */
  MAX_VALUE: 100,
  /** 最小重み */
  MIN_WEIGHT: 0,
  /** 最大重み */
  MAX_WEIGHT: 1,
} as const;

/** テストスコアの基本型 */
export interface TestScore {
  /** スコア値 */
  readonly value: number;
  /** 最大値 */
  readonly maxValue: number;
}

/** スコアメトリクスの基本型 */
export interface ScoreMetrics {
  /** スコア */
  score: number;
  /** パーセンテージ */
  percentage: number;
}

/** 基本科目スコアの型 */
export interface BaseSubjectScore {
  /** 共通テストスコア */
  commonTest: number;
  /** 二次テストスコア */
  secondTest: number;
}

/** 科目スコアの型 */
export interface SubjectScores {
  /** 科目名をキーとした科目スコア */
  [subject: string]: BaseSubjectScore;
}

/** 科目スコアの詳細型 */
export interface SubjectScoreDetail {
  /** 科目名 */
  subject: string;
  /** 共通テストのメトリクス */
  commonTest: ScoreMetrics;
  /** 二次テストのメトリクス */
  secondaryTest: ScoreMetrics;
  /** 合計のメトリクス */
  total: ScoreMetrics;
}

/** 科目スコアの表示用型 */
export interface DisplaySubjectScore extends PieData {
  /** パーセンテージ */
  percentage: number;
  /** カテゴリ */
  category: string;
  /** 表示用の名前 */
  displayName?: string;
}

/** 科目スコアのエラー型 */
export interface SubjectScoreError {
  /** 試験種別 */
  type: ExamTypeName;
  /** エラーコード */
  code: string;
  /** エラーメッセージ */
  message: string;
  /** 科目名 */
  subjectName: SubjectName;
}

/** テスト種別の定数 */
export const TEST_TYPES = {
  /** 共通テスト */
  COMMON: 'common',
  /** 二次テスト */
  SECONDARY: 'secondary',
} as const;
