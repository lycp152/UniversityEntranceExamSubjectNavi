import { z } from "zod";

// 基本モデルのスキーマ
export const BaseModelSchema = z.object({
  id: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
  version: z.number(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
});

// 大学のスキーマ
export const UniversitySchema = BaseModelSchema.extend({
  name: z.string(),
  departments: z.array(z.lazy(() => DepartmentSchema)).optional(),
});

// 学部のスキーマ
export const DepartmentSchema = BaseModelSchema.extend({
  universityId: z.number(),
  name: z.string(),
  majors: z.array(z.lazy(() => MajorSchema)).optional(),
});

// 学科のスキーマ
export const MajorSchema = BaseModelSchema.extend({
  departmentId: z.number(),
  name: z.string(),
  admissionSchedules: z.array(z.lazy(() => AdmissionScheduleSchema)).optional(),
});

// 入試日程のスキーマ
export const AdmissionScheduleSchema = BaseModelSchema.extend({
  majorId: z.number(),
  name: z.enum(["前期", "中期", "後期"]),
  displayOrder: z.number(),
  testTypes: z.array(z.lazy(() => TestTypeSchema)).optional(),
  admissionInfos: z.array(z.lazy(() => AdmissionInfoSchema)).optional(),
});

// 入試情報のスキーマ
export const AdmissionInfoSchema = BaseModelSchema.extend({
  admissionScheduleId: z.number(),
  enrollment: z.number(),
  academicYear: z.number(),
  status: z.enum(["draft", "published", "archived"]),
});

// テストタイプのスキーマ
export const TestTypeSchema = BaseModelSchema.extend({
  admissionScheduleId: z.number(),
  name: z.enum(["共通", "二次"]),
  subjects: z.array(z.lazy(() => SubjectSchema)).optional(),
});

// 科目のスキーマ
export const SubjectSchema = BaseModelSchema.extend({
  testTypeId: z.number(),
  name: z.string(),
  score: z.number(),
  percentage: z.number(),
  displayOrder: z.number(),
});

// APIレスポンスの型
export type University = z.infer<typeof UniversitySchema>;
export type Department = z.infer<typeof DepartmentSchema>;
export type Major = z.infer<typeof MajorSchema>;
export type AdmissionSchedule = z.infer<typeof AdmissionScheduleSchema>;
export type AdmissionInfo = z.infer<typeof AdmissionInfoSchema>;
export type TestType = z.infer<typeof TestTypeSchema>;
export type Subject = z.infer<typeof SubjectSchema>;

export interface APIResponse<T> {
  data: T;
  status: "success" | "error";
  message?: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> extends APIResponse<T> {
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
  };
}
