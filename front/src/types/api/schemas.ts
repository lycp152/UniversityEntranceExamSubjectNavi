import { z } from "zod";

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
