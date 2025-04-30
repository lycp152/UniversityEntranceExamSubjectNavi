/**
 * 科目スコアの型定義
 * 科目のスコア情報を管理するための型定義
 *
 * @module subject-scores
 * @description
 * - 科目スコアの基本情報
 * - 科目の種類と試験種別
 * - スコアの値とパーセンテージ
 * - 表示順序とメタデータ
 */

import type { ExamTypeName } from '@/constants/constraint/exam-types';
import type { SubjectName } from '@/constants/constraint/subjects/subjects';
import type { BaseModel } from '@/types/api/base-model';

/** 科目スコアの型 */
export interface SubjectScore extends BaseModel {
  /** 科目の名称 */
  name: SubjectName;
  /** 科目の試験種別 */
  type: ExamTypeName;
  /** 科目の得点 */
  value: number;
  /** 科目のカテゴリ */
  category: string;
  /** 関連するテストタイプのID */
  testTypeId: number;
  /** 科目の得点率（0-100%） */
  percentage: number;
  /** UI表示時の順序 */
  displayOrder: number;
}
