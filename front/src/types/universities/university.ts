import { BaseModel } from "@/types/base-model";
import type { UniversityStatus } from "@/lib/config/status";
import type { ExamTypeName } from "@/constants/subjects";
/**
 * 大学の基本型定義
 */
export interface University extends BaseModel {
  id: number;
  name: string;
  departments: Department[];
  createdAt: Date;
  updatedAt: Date;
  status: UniversityStatus;
}

/**
 * 学部の型定義
 */
export interface Department extends BaseModel {
  id: number;
  name: string;
  universityId: number;
  majors: Major[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 学科の型定義
 */
export interface Major extends BaseModel {
  name: string;
  departmentId: number;
  admissionSchedules: AdmissionSchedule[];
}

/**
 * 入試情報の型定義
 */
export interface AdmissionInfo {
  id: number;
  majorId: number;
  academicYear: number;
  enrollment: number;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * 入試日程の型定義
 */
export interface AdmissionSchedule extends BaseModel {
  majorId: number;
  name: string;
  displayOrder: number;
  testTypes: TestType[];
  admissionInfos: AdmissionInfo[];
  startDate: Date;
  endDate: Date;
}

/**
 * 試験種別の型定義
 */
export interface TestType extends BaseModel {
  id: number;
  admissionScheduleId: number;
  name: ExamTypeName;
  subjects: Subject[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 科目の型定義
 */
export interface Subject {
  id: number;
  testTypeId: number;
  name: string;
  maxScore: number;
  minScore: number;
  weight: number;
  createdAt: Date;
  updatedAt: Date;
}
