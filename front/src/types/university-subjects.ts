/**
 * 大学科目の型定義
 * 大学科目のUI表示に関する型定義を管理
 *
 * @module university-subjects
 * @description
 * - UI科目情報の型定義
 * - 科目スコアの型定義
 * - 関連情報の型定義
 */

import type { BaseSubjectScore } from '@/types/score';

/** UI科目情報の型 */
export interface UISubject {
  /** 科目の一意の識別子 */
  id: number;
  /** 科目の名称 */
  name: string;
  /** 科目の得点 */
  score: number;
  /** 科目の得点率（0-100%） */
  percentage: number;
  /** UI表示時の順序 */
  displayOrder: number;
  /** 関連するテストタイプのID */
  testTypeId: number;
  /** 科目が所属する大学情報 */
  university: {
    /** 大学の一意の識別子 */
    id: number;
    /** 大学の名称 */
    name: string;
  };
  /** 科目が所属する学部情報 */
  department: {
    /** 学部の一意の識別子 */
    id: number;
    /** 学部の名称 */
    name: string;
  };
  /** 科目が所属する学科情報 */
  major: {
    /** 学科の一意の識別子 */
    id: number;
    /** 学科の名称 */
    name: string;
  };
  /** 科目に関連する入試情報 */
  examInfo: {
    /** 入試情報の一意の識別子 */
    id: number;
    /** 募集定員数 */
    enrollment: number;
    /** 対象年度 */
    academicYear: number;
    /** 入試の状態 */
    status: string;
  };
  /** 科目に関連する入試日程情報 */
  admissionSchedule: {
    /** 入試日程の一意の識別子 */
    id: number;
    /** 入試日程の名称 */
    name: string;
    /** UI表示時の順序 */
    displayOrder: number;
  };
  /** 科目のスコア情報 */
  subjects: Record<string, BaseSubjectScore>;
}
