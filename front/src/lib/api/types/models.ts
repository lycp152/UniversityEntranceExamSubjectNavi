/* TODO 分割する */

import { z } from "zod";

/**
 * 大学一覧取得APIのレスポンス型
 */
export interface GetUniversitiesResponse {
  universities: APIUniversity[];
  total: number;
  page: number;
  limit: number;
}

// APIレスポンスの基本型定義
export interface BaseModel {
  id: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// APIレスポンスの型定義
export interface APIUniversity extends BaseModel {
  name: string;
  departments: APIDepartment[];
}

export interface APIDepartment extends BaseModel {
  name: string;
  university_id: number;
  majors?: APIMajor[];
}

export interface APIMajor extends BaseModel {
  name: string;
  department_id: number;
  admission_schedules: APIAdmissionSchedule[];
}

export interface APIAdmissionSchedule extends BaseModel {
  major_id: number;
  name: string;
  display_order: number;
  test_types: APITestType[];
  admission_infos: APIAdmissionInfo[];
}

export interface APIAdmissionInfo extends BaseModel {
  major_id: number;
  enrollment: number;
  academic_year: number;
  status: string;
}

export interface APITestType extends BaseModel {
  admission_schedule_id: number;
  name: string;
  subjects: APISubject[];
}

export interface APISubject extends BaseModel {
  test_type_id: number;
  name: string;
  score: number;
  percentage: number;
  display_order: number;
}

// Zodスキーマ定義
export const SubjectSchema = z.object({
  id: z.number(),
  test_type_id: z.number(),
  name: z.string(),
  score: z.number(),
  percentage: z.number(),
  display_order: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const TestTypeSchema = z.object({
  id: z.number(),
  admission_schedule_id: z.number(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  subjects: z.array(SubjectSchema),
});

export const AdmissionInfoSchema = z.object({
  id: z.number(),
  major_id: z.number(),
  enrollment: z.number(),
  academic_year: z.number(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const AdmissionScheduleSchema = z.object({
  id: z.number(),
  major_id: z.number(),
  name: z.string(),
  display_order: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  test_types: z.array(TestTypeSchema),
  admission_infos: z.array(AdmissionInfoSchema),
});

export const MajorSchema = z.object({
  id: z.number(),
  department_id: z.number(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  admission_schedules: z.array(AdmissionScheduleSchema),
});

export const DepartmentSchema = z.object({
  id: z.number(),
  university_id: z.number(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  majors: z.array(MajorSchema).optional(),
});

export const UniversitySchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  departments: z.array(DepartmentSchema),
});

// 型のエクスポート
export type University = z.infer<typeof UniversitySchema>;
export type Department = z.infer<typeof DepartmentSchema>;
export type Major = z.infer<typeof MajorSchema>;
export type AdmissionInfo = z.infer<typeof AdmissionInfoSchema>;
export type AdmissionSchedule = z.infer<typeof AdmissionScheduleSchema>;
export type TestType = z.infer<typeof TestTypeSchema>;
export type Subject = z.infer<typeof SubjectSchema>;
