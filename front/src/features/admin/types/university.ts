/**
 * 大学の基本型定義
 * 大学、学部、学科、入試情報などの基本型定義を管理
 *
 * @module university
 * @description
 * - 大学の基本情報の型定義
 * - 学部情報の型定義
 * - 学科情報の型定義
 * - 入試情報の型定義
 * - 入試日程の型定義
 * - 試験種別の型定義
 * - 科目情報の型定義
 */

import { BaseModel } from '@/types/base-model';
import type { SubjectName } from '@/constants/constraint/subjects/subjects';
import type { ExamTypeName } from '@/constants/constraint/exam-types';
import type {
  AdmissionScheduleName,
  DisplayOrder,
} from '@/constants/constraint/admission-schedule';
import { ADMISSION_INFO_CONSTRAINTS } from '@/constants/constraint/admission-info';

/** 大学の基本型 */
export interface University extends BaseModel {
  /** 大学の名称 */
  name: string;
  /** 大学に所属する学部の一覧 */
  departments: Department[];
}

/** 学部の型 */
export interface Department extends BaseModel {
  /** 学部の名称 */
  name: string;
  /** 所属する大学のID */
  universityId: number;
  /** 所属する大学の情報 */
  university?: University;
  /** 学部に所属する学科の一覧 */
  majors: Major[];
}

/** 学科の型 */
export interface Major extends BaseModel {
  /** 学科の名称 */
  name: string;
  /** 所属する学部のID */
  departmentId: number;
  /** 所属する学部の情報 */
  department?: Department;
  /** 学科に関連する入試日程の一覧 */
  admissionSchedules: AdmissionSchedule[];
}

/** 入試情報の型 */
export interface AdmissionInfo extends BaseModel {
  /** 関連する入試日程のID */
  admissionScheduleId: number;
  /** 対象年度 */
  academicYear: number;
  /** 募集定員数 */
  enrollment: number;
  /** 入試の状態 */
  status: (typeof ADMISSION_INFO_CONSTRAINTS.VALID_STATUSES)[number];
  /** 関連する入試日程の情報 */
  admissionSchedule?: AdmissionSchedule;
  /** 入試で実施される試験種別の一覧 */
  testTypes: TestType[];
}

/** 入試日程の型 */
export interface AdmissionSchedule extends BaseModel {
  /** 関連する学科のID */
  majorId: number;
  /** 入試日程の名称 */
  name: AdmissionScheduleName;
  /** UI表示時の順序 */
  displayOrder: DisplayOrder;
  /** 関連する学科の情報 */
  major?: Major;
  /** 入試日程で実施される試験種別の一覧 */
  testTypes: TestType[];
  /** 入試日程に関連する入試情報の一覧 */
  admissionInfos: AdmissionInfo[];
}

/** 試験種別の型 */
export interface TestType extends BaseModel {
  /** 関連する入試日程のID */
  admissionScheduleId: number;
  /** 試験種別の名称 */
  name: ExamTypeName;
  /** 関連する入試日程の情報 */
  admissionSchedule?: AdmissionSchedule;
  /** 試験種別で実施される科目の一覧 */
  subjects: Subject[];
}

/** 科目の型 */
export interface Subject extends BaseModel {
  /** 関連する試験種別のID */
  testTypeId: number;
  /** 科目の名称 */
  name: SubjectName;
  /** 科目の得点 */
  score: number;
  /** 科目の得点率（0-100%） */
  percentage: number;
  /** UI表示時の順序 */
  displayOrder: number;
  /** 関連する試験種別の情報 */
  testType?: TestType;
}
