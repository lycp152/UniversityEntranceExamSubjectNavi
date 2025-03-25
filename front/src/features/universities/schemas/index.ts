import { z } from "zod";
import { UNIVERSITY_STATUS } from "@/lib/config/status";
import { VALIDATION_RULES } from "@/features/universities/constants/validation-rules";

/**
 * 大学のZodスキーマ
 */
export const universitySchema = z.object({
  id: z.number(),
  name: z
    .string()
    .min(VALIDATION_RULES.NAME.MIN_LENGTH)
    .max(VALIDATION_RULES.NAME.MAX_LENGTH)
    .regex(VALIDATION_RULES.NAME.PATTERN),
  code: z
    .string()
    .min(VALIDATION_RULES.CODE.MIN_LENGTH)
    .max(VALIDATION_RULES.CODE.MAX_LENGTH)
    .regex(VALIDATION_RULES.CODE.PATTERN),
  departments: z.array(z.lazy(() => departmentSchema)),
  createdAt: z.date(),
  updatedAt: z.date(),
  status: z.enum(Object.values(UNIVERSITY_STATUS) as [string, ...string[]]),
});

/**
 * 学部のZodスキーマ
 */
export const departmentSchema = z.object({
  id: z.number(),
  name: z
    .string()
    .min(VALIDATION_RULES.NAME.MIN_LENGTH)
    .max(VALIDATION_RULES.NAME.MAX_LENGTH),
  code: z
    .string()
    .min(VALIDATION_RULES.CODE.MIN_LENGTH)
    .max(VALIDATION_RULES.CODE.MAX_LENGTH),
  universityId: z.number(),
  majors: z.array(z.lazy(() => majorSchema)),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * 学科のZodスキーマ
 */
export const majorSchema = z.object({
  id: z.number(),
  name: z
    .string()
    .min(VALIDATION_RULES.NAME.MIN_LENGTH)
    .max(VALIDATION_RULES.NAME.MAX_LENGTH),
  code: z
    .string()
    .min(VALIDATION_RULES.CODE.MIN_LENGTH)
    .max(VALIDATION_RULES.CODE.MAX_LENGTH),
  departmentId: z.number(),
  examInfos: z.array(z.lazy(() => examInfoSchema)),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * 入試情報のZodスキーマ
 */
export const examInfoSchema = z.object({
  id: z.number(),
  majorId: z.number(),
  year: z.number().min(2000).max(2100),
  enrollment: z
    .number()
    .min(VALIDATION_RULES.ENROLLMENT.MIN)
    .max(VALIDATION_RULES.ENROLLMENT.MAX),
  admissionSchedules: z.array(z.lazy(() => admissionScheduleSchema)),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * 入試日程のZodスキーマ
 */
export const admissionScheduleSchema = z.object({
  id: z.number(),
  examInfoId: z.number(),
  name: z
    .string()
    .min(VALIDATION_RULES.NAME.MIN_LENGTH)
    .max(VALIDATION_RULES.NAME.MAX_LENGTH),
  testTypes: z.array(z.lazy(() => testTypeSchema)),
  startDate: z.date(),
  endDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * 試験種別のZodスキーマ
 */
export const testTypeSchema = z.object({
  id: z.number(),
  admissionScheduleId: z.number(),
  name: z
    .string()
    .min(VALIDATION_RULES.NAME.MIN_LENGTH)
    .max(VALIDATION_RULES.NAME.MAX_LENGTH),
  subjects: z.array(z.lazy(() => subjectSchema)),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * 科目のZodスキーマ
 */
export const subjectSchema = z.object({
  id: z.number(),
  testTypeId: z.number(),
  name: z
    .string()
    .min(VALIDATION_RULES.NAME.MIN_LENGTH)
    .max(VALIDATION_RULES.NAME.MAX_LENGTH),
  code: z
    .string()
    .min(VALIDATION_RULES.CODE.MIN_LENGTH)
    .max(VALIDATION_RULES.CODE.MAX_LENGTH),
  maxScore: z.number().min(0),
  minScore: z.number().min(0),
  weight: z.number().min(0).max(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});
