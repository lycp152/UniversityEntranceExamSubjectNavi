import { z } from 'zod';
import { UniversitySchema, DepartmentSchema } from './api-schemas';

// 基本的なレスポンススキーマ
export const BaseResponseSchema = z.object({
  success: z.boolean(),
  timestamp: z.number(),
  message: z.string().optional(),
});

// 大学一覧のレスポンススキーマ
export const UniversitiesResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    universities: z.array(UniversitySchema),
    total: z.number(),
    page: z.number(),
    perPage: z.number(),
  }),
});

// 学部一覧のレスポンススキーマ
export const DepartmentsResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    departments: z.array(DepartmentSchema),
    total: z.number(),
    page: z.number(),
    perPage: z.number(),
  }),
});

// エラーレスポンスのスキーマ
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  code: z.string(),
  details: z.record(z.unknown()).optional(),
  timestamp: z.number(),
});

// 型の定義
export type BaseResponse = z.infer<typeof BaseResponseSchema>;
export type UniversitiesResponse = z.infer<typeof UniversitiesResponseSchema>;
export type DepartmentsResponse = z.infer<typeof DepartmentsResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
