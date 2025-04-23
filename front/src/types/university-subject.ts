/**
 * 大学科目の型定義
 * 大学科目のUI表示に関する型定義を管理
 * バックエンドのAPIエンドポイントと同期を保つ必要があります
 * @see back/migrations/seeds/main.go
 * @see back/internal/domain/models/models.go
 *
 * @module university-subjects
 * @description
 * - UI科目情報の型定義
 * - 科目スコアの型定義
 * - 関連情報の型定義
 */

import type { BaseSubjectScore } from '@/types/score';
import type { BaseModel } from './api/base-model';
import { z } from 'zod';
import { commonValidationRules } from './api/schemas';

/** 大学情報のスキーマ */
const UniversityInfoSchema = z.object({
  /** 大学の一意の識別子 */
  id: z.number().min(1),
  /** 大学の名称 */
  name: z.string().min(1).max(100),
});

/** 学部情報のスキーマ */
const DepartmentInfoSchema = z.object({
  /** 学部の一意の識別子 */
  id: z.number().min(1),
  /** 学部の名称 */
  name: z.string().min(1).max(100),
});

/** 学科情報のスキーマ */
const MajorInfoSchema = z.object({
  /** 学科の一意の識別子 */
  id: z.number().min(1),
  /** 学科の名称 */
  name: z.string().min(1).max(100),
});

/** 入試情報のスキーマ */
const ExamInfoSchema = z.object({
  /** 入試情報の一意の識別子 */
  id: z.number().min(1),
  /** 募集定員数 */
  enrollment: z.number().min(1).max(9999),
  /** 対象年度 */
  academicYear: z.number().min(2000).max(2100),
  /** 入試の状態 */
  status: z.string(),
});

/** 入試日程情報のスキーマ */
const AdmissionScheduleInfoSchema = z.object({
  /** 入試日程の一意の識別子 */
  id: z.number().min(1),
  /** 入試日程の名称 */
  name: z.string(),
  /** UI表示時の順序 */
  displayOrder: z.number().min(0).max(3),
});

/** UI科目情報のスキーマ */
export const UISubjectSchema = z.object({
  ...commonValidationRules,
  /** 科目の名称 */
  name: z.string().min(1).max(50),
  /** 科目の得点 */
  score: z.number().min(0).max(1000),
  /** 科目の得点率（0-100%） */
  percentage: z.number().min(0).max(100),
  /** UI表示時の順序 */
  displayOrder: z.number().min(0),
  /** 関連するテストタイプのID */
  testTypeId: z.number().min(1),
  /** 科目が所属する大学情報 */
  university: UniversityInfoSchema,
  /** 科目が所属する学部情報 */
  department: DepartmentInfoSchema,
  /** 科目が所属する学科情報 */
  major: MajorInfoSchema,
  /** 科目に関連する入試情報 */
  examInfo: ExamInfoSchema,
  /** 科目に関連する入試日程情報 */
  admissionSchedule: AdmissionScheduleInfoSchema,
  /** 科目のスコア情報 */
  subjects: z.record(
    z.string(),
    z.object({
      commonTest: z.number().min(0).max(1000),
      secondTest: z.number().min(0).max(1000),
    })
  ),
});

/** UI科目情報の型 */
export interface UISubject extends BaseModel {
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
