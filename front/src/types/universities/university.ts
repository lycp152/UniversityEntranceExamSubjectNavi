import { BaseModel } from "@/types/base-model";
import type { ExamTypeName, SubjectName } from "@/constants/subjects";
import type {
  AdmissionScheduleName,
  DisplayOrder,
} from "@/constants/admission-schedule";
import { ADMISSION_INFO_CONSTRAINTS } from "@/constants/admission-schedule";

/**
 * 大学の基本型定義
 */
export interface University extends BaseModel {
  name: string;
  departments: Department[];
}

/**
 * 学部の型定義
 */
export interface Department extends BaseModel {
  name: string;
  universityId: number;
  university?: University;
  majors: Major[];
}

/**
 * 学科の型定義
 */
export interface Major extends BaseModel {
  name: string;
  departmentId: number;
  department?: Department;
  admissionSchedules: AdmissionSchedule[];
}

/**
 * 入試情報の型定義
 */
export interface AdmissionInfo extends BaseModel {
  admissionScheduleId: number;
  academicYear: number;
  enrollment: number;
  status: (typeof ADMISSION_INFO_CONSTRAINTS.VALID_STATUSES)[number];
  admissionSchedule?: AdmissionSchedule;
  testTypes: TestType[];
}

/**
 * 入試日程の型定義
 */
export interface AdmissionSchedule extends BaseModel {
  majorId: number;
  name: AdmissionScheduleName;
  displayOrder: DisplayOrder;
  major?: Major;
  testTypes: TestType[];
  admissionInfos: AdmissionInfo[];
}

/**
 * 試験種別の型定義
 */
export interface TestType extends BaseModel {
  admissionScheduleId: number;
  name: ExamTypeName;
  admissionSchedule?: AdmissionSchedule;
  subjects: Subject[];
}

/**
 * 科目の型定義
 */
export interface Subject extends BaseModel {
  testTypeId: number;
  name: SubjectName;
  score: number;
  percentage: number;
  displayOrder: number;
  testType?: TestType;
}
