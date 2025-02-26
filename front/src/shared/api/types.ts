import { z } from 'zod';

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

// 科目のスキーマ
export const SubjectSchema = BaseModelSchema.extend({
  testTypeId: z.number(),
  name: z.string(),
  score: z.number(),
  percentage: z.number(),
  displayOrder: z.number(),
});

// テストタイプのスキーマ
export const TestTypeSchema = BaseModelSchema.extend({
  admissionScheduleId: z.number(),
  name: z.enum(['共通', '二次']),
  subjects: z.array(SubjectSchema),
});

// 入試日程のスキーマ
export const AdmissionScheduleSchema = BaseModelSchema.extend({
  admissionInfoId: z.number(),
  name: z.enum(['前期', '中期', '後期']),
  displayOrder: z.number(),
  testTypes: z.array(TestTypeSchema),
});

// 入試情報のスキーマ
export const AdmissionInfoSchema = BaseModelSchema.extend({
  majorId: z.number(),
  enrollment: z.number(),
  academicYear: z.number(),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
  status: z.enum(['draft', 'published', 'archived']),
  admissionSchedules: z.array(AdmissionScheduleSchema),
});

// 学科のスキーマ
export const MajorSchema = BaseModelSchema.extend({
  departmentId: z.number(),
  name: z.string(),
  admissionInfos: z.array(AdmissionInfoSchema),
});

// 学部のスキーマ
export const DepartmentSchema = BaseModelSchema.extend({
  universityId: z.number(),
  name: z.string(),
  majors: z.array(MajorSchema),
});

// 大学のスキーマ
export const UniversitySchema = BaseModelSchema.extend({
  name: z.string(),
  departments: z.array(DepartmentSchema),
});

// APIレスポンスの型
export type University = z.infer<typeof UniversitySchema>;
export type Department = z.infer<typeof DepartmentSchema>;
export type Major = z.infer<typeof MajorSchema>;
export type AdmissionInfo = z.infer<typeof AdmissionInfoSchema>;
export type AdmissionSchedule = z.infer<typeof AdmissionScheduleSchema>;
export type TestType = z.infer<typeof TestTypeSchema>;
export type Subject = z.infer<typeof SubjectSchema>;
