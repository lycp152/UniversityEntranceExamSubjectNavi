import { z } from 'zod';
import { validationMessages } from '@/lib/validation/error-messages';

export const SubjectSchema = z.object({
  id: z.number(),
  test_type_id: z.number(),
  name: z.string(),
  score: z.number(),
  percentage: z.number(),
  display_order: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
  version: z.number(),
  created_by: z.string(),
  updated_by: z.string(),
});

export const TestTypeSchema = z.object({
  id: z.number(),
  admission_schedule_id: z.number(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
  version: z.number(),
  created_by: z.string(),
  updated_by: z.string(),
  subjects: z.array(SubjectSchema),
});

export const AdmissionScheduleSchema: z.ZodType = z.object({
  id: z.number(),
  major_id: z.number(),
  name: z.string(),
  display_order: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  test_types: z.array(TestTypeSchema),
  admission_infos: z.array(z.lazy(() => AdmissionInfoSchema)),
});

export const AdmissionInfoSchema: z.ZodType = z.object({
  id: z.number(),
  admission_schedule_id: z.number(),
  enrollment: z.number(),
  academic_year: z.number(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  admission_schedule: z.lazy(() => AdmissionScheduleSchema),
  test_types: z.array(TestTypeSchema),
});

export const MajorSchema = z.object({
  id: z.number(),
  department_id: z.number(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  version: z.number(),
  created_by: z.string(),
  updated_by: z.string(),
  admission_schedules: z.array(AdmissionScheduleSchema),
});

export const DepartmentSchema = z.object({
  id: z.number(),
  university_id: z.number(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  version: z.number(),
  created_by: z.string(),
  updated_by: z.string(),
  majors: z.array(MajorSchema).optional(),
});

// 共通のバリデーションルール
export const commonRules = {
  id: z.number().min(1, validationMessages.number.min(1)),
  name: z.string().min(1, validationMessages.required).max(100, validationMessages.string.max(100)),
  location: z
    .string()
    .min(1, validationMessages.required)
    .max(100, validationMessages.string.max(100)),
  description: z.string().max(1000, validationMessages.string.max(1000)).optional(),
  website: z.string().url(validationMessages.url).optional(),
  type: z.enum(['国立', '公立', '私立'], {
    errorMap: () => ({ message: validationMessages.enum }),
  }),
};

// 大学情報のスキーマ
export const UniversitySchema = z.object({
  id: z.number().min(1, validationMessages.number.min(1)),
  name: z.string().min(1, validationMessages.required).max(100, validationMessages.string.max(100)),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  version: z.number().min(1, validationMessages.number.min(1)),
  created_by: z.string(),
  updated_by: z.string(),
  departments: z.array(DepartmentSchema),
});

// 検索フォームのスキーマ
export const SearchFormSchema = z.object({
  keyword: z.string().optional(),
  type: z.string().optional(),
  location: z.string().optional(),
  region: z.array(z.string()).optional(),
  academicField: z.array(z.string()).optional(),
  schedule: z.array(z.string()).optional(),
  classification: z.array(z.string()).optional(),
  sortOrder: z
    .array(
      z.object({
        examType: z.string(),
        subjectName: z.string(),
        order: z.string(),
      })
    )
    .optional(),
  page: z.number().min(1, validationMessages.search.page),
  perPage: z
    .number()
    .min(1, validationMessages.search.perPage)
    .max(100, validationMessages.search.perPage),
});

// 検索結果のスキーマ
export const SearchResultSchema = z.object({
  items: z.array(UniversitySchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  hasMore: z.boolean(),
});

// 検索リクエストのスキーマ
export const SearchUniversitiesRequestSchema = z.object({
  query: z.string().min(1, validationMessages.search.keyword.min),
  page: z.number().min(1, validationMessages.search.page),
  perPage: z.number().min(1, validationMessages.search.perPage),
});

export const GetUniversityRequestSchema = z.object({
  id: z.number().min(1, validationMessages.number.min(1)),
});

export const SearchDepartmentsRequestSchema = z.object({
  universityId: z.number().min(1, validationMessages.number.min(1)),
  query: z.string().optional(),
  page: z.number().min(1, validationMessages.search.page),
  perPage: z.number().min(1, validationMessages.search.perPage),
});

export const SearchMajorsRequestSchema = z.object({
  departmentId: z.number().min(1, validationMessages.number.min(1)),
  query: z.string().optional(),
  page: z.number().min(1, validationMessages.search.page),
  perPage: z.number().min(1, validationMessages.search.perPage),
});

// 型のエクスポート
export type University = z.infer<typeof UniversitySchema>;
export type Department = z.infer<typeof DepartmentSchema>;
export type Major = z.infer<typeof MajorSchema>;
export type AdmissionInfo = z.infer<typeof AdmissionInfoSchema>;
export type AdmissionSchedule = z.infer<typeof AdmissionScheduleSchema>;
export type TestType = z.infer<typeof TestTypeSchema>;
export type Subject = z.infer<typeof SubjectSchema>;
export type SearchFormData = z.infer<typeof SearchFormSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type SearchUniversitiesRequest = z.infer<typeof SearchUniversitiesRequestSchema>;
export type GetUniversityRequest = z.infer<typeof GetUniversityRequestSchema>;
export type SearchDepartmentsRequest = z.infer<typeof SearchDepartmentsRequestSchema>;
export type SearchMajorsRequest = z.infer<typeof SearchMajorsRequestSchema>;
