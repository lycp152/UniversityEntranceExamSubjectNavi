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

import type { PieData } from '@/types/pie-chart';

/** テスト種別の型 */
export type TestType = (typeof TEST_TYPES)[keyof typeof TEST_TYPES];

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

/** 科目スコアの表示用型 */
export interface DisplaySubjectScore extends PieData {
  /** パーセンテージ */
  percentage: number;
  /** カテゴリ */
  category: string;
  /** 表示用の名前 */
  displayName?: string;
}

/** テスト種別の定数 */
export const TEST_TYPES = {
  /** 共通テスト */
  COMMON: 'common',
  /** 二次テスト */
  SECONDARY: 'secondary',
} as const;
